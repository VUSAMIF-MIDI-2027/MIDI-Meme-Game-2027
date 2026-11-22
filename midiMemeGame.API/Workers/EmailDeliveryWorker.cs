using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Workers;

public class EmailDeliveryWorker : BackgroundService
{
    private static readonly TimeSpan MarkSentTimeout = TimeSpan.FromSeconds(5);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly SmtpSettings _settings;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailDeliveryWorker> _logger;

    private DateTime _smtpResumeAtUtc;

    public EmailDeliveryWorker(
        IServiceScopeFactory scopeFactory,
        IOptions<SmtpSettings> settings,
        IOptions<EmailSettings> emailSettings,
        ILogger<EmailDeliveryWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _settings = settings.Value;
        _emailSettings = emailSettings.Value;
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
        if (DateTime.UtcNow < _smtpResumeAtUtc)
            return;

        using var scope = _scopeFactory.CreateScope();
        var deliveryQueries = scope.ServiceProvider.GetRequiredService<EmailDeliveryQueries>();
        var smtpSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();

        var now = DateTime.UtcNow;

        var releaseStaleResult = await deliveryQueries.ReleaseStaleAsync(
            now.AddMinutes(-_emailSettings.StaleLeaseMinutes),
            cancellationToken);

        if (releaseStaleResult.IsError)
        {
            _logger.LogError(LogMessages.Email.RELEASE_STALE_FAILED_ERROR, releaseStaleResult.Error);
            return;
        }

        var claimResult = await deliveryQueries.ClaimPendingBatchAsync(_emailSettings.DeliveryBatchSize, now, cancellationToken);
        if (claimResult.IsError)
        {
            _logger.LogError(LogMessages.Email.CLAIM_BATCH_FAILED_ERROR, claimResult.Error);
            return;
        }

        if (claimResult.Value.Count == 0)
            return;

        var batch = claimResult.Value;

        var sessionResult = await smtpSender.OpenSessionAsync(cancellationToken);
        if (sessionResult.IsError)
        {
            var attemptedAt = DateTime.UtcNow;
            var isPermanent = sessionResult.Error == ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            var isQuotaExceeded = sessionResult.Error == ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;
            var sessionError = sessionResult.Error.ToString();

            if (isPermanent)
            {
                foreach (var delivery in batch)
                {
                    var markFailedResult = await deliveryQueries.MarkFailedAsync(delivery.Id, sessionError, cancellationToken);
                    if (markFailedResult.IsError)
                        _logger.LogError(LogMessages.Email.MARK_FAILED_ERROR, delivery.Id, markFailedResult.Error);
                    else
                        _logger.LogError(LogMessages.Email.SEND_FAILED, delivery.Id, delivery.AttemptCount + 1);
                }
                return;
            }

            var retryDelay = isQuotaExceeded ? TimeSpan.FromHours(1) : TimeSpan.FromMinutes(1);
            var nextAttemptAt = attemptedAt.Add(retryDelay);

            if (isQuotaExceeded)
                _smtpResumeAtUtc = nextAttemptAt;
            
            var batchIds = batch.Select(d => d.Id).ToList();

            var releaseResult = await deliveryQueries.ReleaseWithoutAttemptAsync(
                batchIds,
                nextAttemptAt,
                sessionError,
                cancellationToken);

            if (releaseResult.IsError)
                _logger.LogError(LogMessages.Email.RELEASE_FAILED_ERROR, batchIds.Count, releaseResult.Error);
            else
                _logger.LogWarning(LogMessages.Email.RELEASED_WITHOUT_ATTEMPT, releaseResult.Value, nextAttemptAt, sessionError);

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
                    nameof(OperationCanceledException),
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
                using var markSentTimeout = new CancellationTokenSource(MarkSentTimeout);
                var markSentResult = await deliveryQueries.MarkSentAsync(delivery.Id, attemptedAt, markSentTimeout.Token);
                if (markSentResult.IsError)
                    _logger.LogError(LogMessages.Email.MARK_SENT_FAILED_ERROR, delivery.Id, markSentResult.Error);
                else
                    _logger.LogInformation(LogMessages.Email.SENT, delivery.Id);

                continue;
            }

            var isPermanent = sendResult.Error == ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            var isQuotaExceeded = sendResult.Error == ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;
            var sendError = sendResult.Error.ToString();

            if (isQuotaExceeded)
            {
                var remainingIds = batch.Skip(i).Select(d => d.Id).ToList();
                var nextAttemptAt = attemptedAt.Add(TimeSpan.FromHours(1));
                _smtpResumeAtUtc = nextAttemptAt;

                var releaseResult = await deliveryQueries.ReleaseWithoutAttemptAsync(
                    remainingIds,
                    nextAttemptAt,
                    sendError,
                    cancellationToken);

                if (releaseResult.IsError)
                    _logger.LogError(LogMessages.Email.RELEASE_FAILED_ERROR, remainingIds.Count, releaseResult.Error);
                else
                    _logger.LogWarning(LogMessages.Email.QUOTA_EXCEEDED_PAUSED, delivery.Id, releaseResult.Value, nextAttemptAt);

                break;
            }

            var nextAttemptNumber = delivery.AttemptCount + 1;
            if (isPermanent || nextAttemptNumber >= _settings.MaxAttempts)
            {
                var markFailedResult = await deliveryQueries.MarkFailedAsync(delivery.Id, sendError, cancellationToken);
                if (markFailedResult.IsError)
                    _logger.LogError(LogMessages.Email.MARK_FAILED_ERROR, delivery.Id, markFailedResult.Error);
                else
                    _logger.LogError(LogMessages.Email.SEND_FAILED, delivery.Id, nextAttemptNumber);
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
                    _logger.LogError(LogMessages.Email.SCHEDULE_RETRY_FAILED_ERROR, delivery.Id, retryResult.Error);
                else
                    _logger.LogWarning(LogMessages.Email.SEND_RETRY, delivery.Id, nextAttemptNumber, nextAttemptAt);
            }
        }
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation(LogMessages.Email.WORKER_STARTING, GetType().Name);
        return base.StartAsync(cancellationToken);
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation(LogMessages.Email.WORKER_STOPPING, GetType().Name);
        return base.StopAsync(cancellationToken);
    }
}