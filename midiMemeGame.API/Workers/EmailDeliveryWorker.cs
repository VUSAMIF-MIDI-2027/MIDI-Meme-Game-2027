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

        var batch = claimResult.Value;

        var sessionResult = await smtpSender.OpenSessionAsync(cancellationToken);
        if (sessionResult.IsError)
        {
            var attemptedAt = DateTime.UtcNow;
            var isPermanent = sessionResult.Error == ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            var isQuotaExceeded = sessionResult.Error == ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;
            var sessionError = !string.IsNullOrWhiteSpace(sessionResult.ErrorMessage)
                ? sessionResult.ErrorMessage
                : (isPermanent ? "Permanent SMTP authentication/connection failure." : "SMTP connection failure.");

            if (isPermanent)
            {
                foreach (var delivery in batch)
                {
                    var markFailedResult = await deliveryQueries.MarkFailedAsync(delivery.Id, sessionError, cancellationToken);
                    if (markFailedResult.IsError)
                    {
                        _logger.LogError(
                            "Failed to mark email delivery {DeliveryId} as Failed ({Error}).",
                            delivery.Id,
                            markFailedResult.Error);
                    }
                    else
                    {
                        _logger.LogError(LogMessages.Email.SEND_FAILED, delivery.Id, delivery.AttemptCount + 1);
                    }
                }
                return;
            }

            var retryDelay = isQuotaExceeded ? TimeSpan.FromHours(1) : TimeSpan.FromMinutes(1);
            var nextAttemptAt = attemptedAt.Add(retryDelay);
            var batchIds = batch.Select(d => d.Id).ToList();

            var releaseResult = await deliveryQueries.ReleaseWithoutAttemptAsync(
                batchIds,
                nextAttemptAt,
                sessionError,
                cancellationToken);

            if (releaseResult.IsError)
            {
                _logger.LogError(
                    "Failed to release {Count} email deliveries after SMTP session error ({Error}).",
                    batchIds.Count,
                    releaseResult.Error);
            }
            else
            {
                _logger.LogWarning(
                    "Released {Count} email deliveries without consuming attempts until {NextAttemptAtUtc:O}. Reason: {Reason}",
                    releaseResult.Value,
                    nextAttemptAt,
                    sessionError);
            }

            return;
        }

        await using var smtpSession = sessionResult.Value;

        for (var i = 0; i < batch.Count; i++)
        {
            var delivery = batch[i];

            if (cancellationToken.IsCancellationRequested)
            {
                var remainingIds = batch.Skip(i).Select(d => d.Id).ToList();
                await deliveryQueries.ReleaseWithoutAttemptAsync(
                    remainingIds,
                    DateTime.UtcNow,
                    "Worker shutdown requested before send.",
                    CancellationToken.None);
                break;
            }

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
            var sendError = !string.IsNullOrWhiteSpace(sendResult.ErrorMessage)
                ? sendResult.ErrorMessage
                : (isPermanent ? "Permanent SMTP failure." : "Transient SMTP failure.");

            if (isQuotaExceeded)
            {
                var remainingIds = batch.Skip(i).Select(d => d.Id).ToList();
                var nextAttemptAt = attemptedAt.Add(TimeSpan.FromHours(1));

                var releaseResult = await deliveryQueries.ReleaseWithoutAttemptAsync(
                    remainingIds,
                    nextAttemptAt,
                    sendError,
                    cancellationToken);

                if (releaseResult.IsError)
                {
                    _logger.LogError(
                        "Failed to release {Count} email deliveries after SMTP quota exceeded ({Error}).",
                        remainingIds.Count,
                        releaseResult.Error);
                }
                else
                {
                    _logger.LogWarning(
                        "SMTP quota exceeded on delivery {DeliveryId}; paused {Count} remaining deliveries without consuming attempts until {NextAttemptAtUtc:O}.",
                        delivery.Id,
                        releaseResult.Value,
                        nextAttemptAt);
                }
                break;
            }

            var nextAttemptNumber = delivery.AttemptCount + 1;
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
                var nextAttemptAt = attemptedAt.AddMinutes(backoffMinutes);
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