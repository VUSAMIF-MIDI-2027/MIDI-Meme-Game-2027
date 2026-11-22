using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Services;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Workers;

public class ScheduledEmailWorker : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan MaxMilestoneAge = TimeSpan.FromHours(24);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ScheduledEmailWorker> _logger;

    public ScheduledEmailWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<ScheduledEmailWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessMilestonesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, LogMessages.Email.SCHEDULED_WORKER_ITERATION_FAILED);
            }

            try
            {
                await Task.Delay(PollInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ProcessMilestonesAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var scheduleQueries = scope.ServiceProvider.GetRequiredService<EventScheduleQueries>();
        var userQueries = scope.ServiceProvider.GetRequiredService<UserQueries>();
        var templateQueries = scope.ServiceProvider.GetRequiredService<EmailTemplateQueries>();
        var progressQueries = scope.ServiceProvider.GetRequiredService<EmailMilestoneProgressQueries>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var scheduleResult = await scheduleQueries.GetAsync(ct);
        if (scheduleResult.IsError || scheduleResult.Value is null)
            return;

        var schedule = scheduleResult.Value;
        var nowUtc = DateTimeOffset.UtcNow;
        var eventId = schedule.EventStartsAt.ToUnixTimeSeconds().ToString();

        var milestones = new (string Key, DateTimeOffset At)[]
        {
            (EmailTemplateKeys.EventStarted, schedule.EventStartsAt),
            (EmailTemplateKeys.VotingOpened, schedule.VotingStartsAt),
            (EmailTemplateKeys.EventEnded, schedule.EventEndsAt)
        };

        foreach (var milestone in milestones)
        {
            if (milestone.At > nowUtc)
                continue;

            var completedResult = await progressQueries.IsCompletedAsync(eventId, milestone.Key, ct);
            if (completedResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId);
                return;
            }

            if (completedResult.Value)
                continue;

            if (nowUtc - milestone.At > MaxMilestoneAge)
            {
                _logger.LogInformation(
                    "Skipping stale milestone {MilestoneKey} for event {EventId} (scheduled at {ScheduledAtUtc} UTC).",
                    milestone.Key,
                    eventId,
                    milestone.At);

                var skipMarkResult = await progressQueries.MarkCompletedAsync(eventId, milestone.Key, DateTime.UtcNow, ct);
                if (skipMarkResult.IsError)
                {
                    _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId);
                    return;
                }

                continue;
            }

            var templateResult = await templateQueries.GetByKeyAsync(milestone.Key, ct);
            if (templateResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId);
                return;
            }

            var usersResult = await userQueries.GetActiveEmailRecipientsAsync(ct);
            if (usersResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId);
                return;
            }

            foreach (var user in usersResult.Value)
            {
                var variables = new Dictionary<string, string>
                {
                    ["recipientName"] = EmailTemplateHelper.BuildRecipientName(user.FirstName, user.LastName)
                };

                var deduplicationKey = $"{eventId}:{milestone.Key}:user:{user.Id}";
                var enqueueResult = await emailService.EnqueueTemplatedAsync(
                    templateResult.Value,
                    user.Email,
                    variables,
                    deduplicationKey,
                    ct);

                if (enqueueResult.IsError && enqueueResult.Error != ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID)
                {
                    _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId);
                    return;
                }
            }

            var markResult = await progressQueries.MarkCompletedAsync(eventId, milestone.Key, DateTime.UtcNow, ct);
            if (markResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId);
                return;
            }
        }
    }
}