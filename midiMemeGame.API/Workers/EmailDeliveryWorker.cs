using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Workers;

public class EmailDeliveryWorker : BackgroundService
{
    private const int BatchSize = 20;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly SmtpSettings _settings;
    private readonly ILogger<EmailDeliveryWorker> _logger;

    public EmailDeliveryWorker(
        IServiceScopeFactory scopeFactory,
        IOptions<SmtpSettings> settings,
        ILogger<EmailDeliveryWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _settings = settings.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var pollDelay = TimeSpan.FromSeconds(_settings.PollIntervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessBatchAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, LogMessages.Email.WORKER_ITERATION_FAILED);
            }

            try
            {
                await Task.Delay(pollDelay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ProcessBatchAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var deliveryQueries = scope.ServiceProvider.GetRequiredService<EmailDeliveryQueries>();
        var smtpSender = scope.ServiceProvider.GetRequiredService<SmtpEmailSender>();

        var now = DateTime.UtcNow;
        var claimResult = await deliveryQueries.ClaimPendingBatchAsync(BatchSize, now, cancellationToken);
        if (claimResult.IsError || claimResult.Value.Count == 0)
            return;

        foreach (var delivery in claimResult.Value)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            var isHtml = EmailTemplateHelper.IsHtml(delivery.Body);
            var sendResult = await smtpSender.SendAsync(
                delivery.Id,
                delivery.RecipientAddress,
                toName: null,
                delivery.Subject,
                delivery.Body,
                isHtml,
                cancellationToken);

            var attemptedAt = DateTime.UtcNow;

            if (!sendResult.IsError)
            {
                await deliveryQueries.MarkSentAsync(delivery.Id, attemptedAt, cancellationToken);
                _logger.LogInformation(LogMessages.Email.SENT, delivery.Id);
                continue;
            }

            var isPermanent = sendResult.Error == ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            var nextAttemptNumber = delivery.AttemptCount + 1;

            if (isPermanent || nextAttemptNumber >= _settings.MaxAttempts)
            {
                var reason = isPermanent
                    ? "Permanent SMTP failure."
                    : $"Exceeded max retry attempts ({_settings.MaxAttempts}).";

                await deliveryQueries.MarkFailedAsync(delivery.Id, reason, cancellationToken);
                _logger.LogError(LogMessages.Email.SEND_FAILED, delivery.Id, nextAttemptNumber);
            }
            else
            {
                var backoffSeconds = Math.Pow(2, delivery.AttemptCount) * 10;
                var nextAttemptAt = attemptedAt.AddSeconds(backoffSeconds);

                await deliveryQueries.ScheduleRetryAsync(
                    delivery.Id,
                    nextAttemptAt,
                    "Transient SMTP failure; scheduled for retry.",
                    cancellationToken);

                _logger.LogWarning(
                    LogMessages.Email.SEND_RETRY,
                    delivery.Id,
                    nextAttemptNumber,
                    nextAttemptAt);
            }
        }
    }
}