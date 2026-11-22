using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;

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
        var smtpSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();

        var now = DateTime.UtcNow;

        await deliveryQueries.ReleaseStaleAsync(now.AddMinutes(-10), cancellationToken);

        var claimResult = await deliveryQueries.ClaimPendingBatchAsync(BatchSize, now, cancellationToken);
        if (claimResult.IsError || claimResult.Value.Count == 0)
            return;

        var sessionResult = await smtpSender.OpenSessionAsync(cancellationToken);
        if (sessionResult.IsError)
        {
            var attemptedAt = DateTime.UtcNow;
            var isPermanent = sessionResult.Error == ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            var isQuotaExceeded = sessionResult.Error == ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;
            var sessionError = !string.IsNullOrWhiteSpace(sessionResult.ErrorMessage)
                ? sessionResult.ErrorMessage
                : (isPermanent ? "Permanent SMTP authentication/connection failure." : "SMTP connection failure.");

            foreach (var delivery in claimResult.Value)
            {
                var nextAttemptNumber = delivery.AttemptCount + 1;
                if (isPermanent || nextAttemptNumber >= _settings.MaxAttempts)
                {
                    var reason = isPermanent
                        ? sessionError
                        : $"Exceeded max retry attempts ({_settings.MaxAttempts}). Last error: {sessionError}";

                    var markFailedResult = await deliveryQueries.MarkFailedAsync(delivery.Id, reason, cancellationToken);
                    if (markFailedResult.IsError)
                    {
                        _logger.LogError(
                            "Failed to mark email delivery {DeliveryId} as Failed ({Error}).",
                            delivery.Id,
                            markFailedResult.Error);
                    }
                    else
                    {
                        _logger.LogError(LogMessages.Email.SEND_FAILED, delivery.Id, nextAttemptNumber);
                    }
                }
                else
                {
                    var retryDelay = isQuotaExceeded
                        ? TimeSpan.FromHours(1)
                        : TimeSpan.FromMinutes(Math.Min(Math.Pow(2, delivery.AttemptCount), 60));

                    var nextAttemptAt = attemptedAt.Add(retryDelay);
                    var retryResult = await deliveryQueries.ScheduleRetryAsync(
                        delivery.Id,
                        nextAttemptAt,
                        sessionError,
                        cancellationToken);

                    if (retryResult.IsError)
                    {
                        _logger.LogError(
                            "Failed to schedule retry for email delivery {DeliveryId} ({Error}).",
                            delivery.Id,
                            retryResult.Error);
                    }
                    else
                    {
                        _logger.LogWarning(
                            LogMessages.Email.SEND_RETRY,
                            delivery.Id,
                            nextAttemptNumber,
                            nextAttemptAt);
                    }
                }
            }
            return;
        }

        await using var smtpSession = sessionResult.Value;

        foreach (var delivery in claimResult.Value)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            var sendResult = await smtpSession.SendAsync(
                delivery.Id,
                delivery.RecipientAddress,
                toName: null,
                delivery.Subject,
                delivery.Body,
                delivery.IsHtml,
                cancellationToken);

            var attemptedAt = DateTime.UtcNow;

            if (!sendResult.IsError)
            {
                var markSentResult = await deliveryQueries.MarkSentAsync(delivery.Id, attemptedAt, cancellationToken);
                if (markSentResult.IsError)
                {
                    _logger.LogError(
                        "Email delivery {DeliveryId} was sent via SMTP, but failed to update status to Sent ({Error}). Duplicate send possible after lease expiry.",
                        delivery.Id,
                        markSentResult.Error);
                }
                else
                {
                    _logger.LogInformation(LogMessages.Email.SENT, delivery.Id);
                }
                continue;
            }

            var isPermanent = sendResult.Error == ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            var isQuotaExceeded = sendResult.Error == ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;
            var nextAttemptNumber = delivery.AttemptCount + 1;
            var sendError = !string.IsNullOrWhiteSpace(sendResult.ErrorMessage)
                ? sendResult.ErrorMessage
                : (isPermanent ? "Permanent SMTP failure." : "Transient SMTP failure.");

            if (isPermanent || nextAttemptNumber >= _settings.MaxAttempts)
            {
                var reason = isPermanent
                    ? sendError
                    : $"Exceeded max retry attempts ({_settings.MaxAttempts}). Last error: {sendError}";

                var markFailedResult = await deliveryQueries.MarkFailedAsync(delivery.Id, reason, cancellationToken);
                if (markFailedResult.IsError)
                {
                    _logger.LogError(
                        "Failed to mark email delivery {DeliveryId} as Failed ({Error}).",
                        delivery.Id,
                        markFailedResult.Error);
                }
                else
                {
                    _logger.LogError(LogMessages.Email.SEND_FAILED, delivery.Id, nextAttemptNumber);
                }
            }
            else
            {
                var backoffMinutes = Math.Min(Math.Pow(2, delivery.AttemptCount), 60);
                var retryDelay = isQuotaExceeded
                    ? TimeSpan.FromHours(1)
                    : TimeSpan.FromMinutes(backoffMinutes);

                var nextAttemptAt = attemptedAt.Add(retryDelay);
                var retryResult = await deliveryQueries.ScheduleRetryAsync(
                    delivery.Id,
                    nextAttemptAt,
                    sendError,
                    cancellationToken);

                if (retryResult.IsError)
                {
                    _logger.LogError(
                        "Failed to schedule retry for email delivery {DeliveryId} ({Error}).",
                        delivery.Id,
                        retryResult.Error);
                }
                else
                {
                    _logger.LogWarning(
                        LogMessages.Email.SEND_RETRY,
                        delivery.Id,
                        nextAttemptNumber,
                        nextAttemptAt);
                }
            }
        }
    }
}