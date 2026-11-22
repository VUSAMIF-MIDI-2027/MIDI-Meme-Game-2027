using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Services;

public class ScheduledEmailService : IScheduledEmailService
{
    private readonly EventScheduleQueries _scheduleQueries;
    private readonly UserQueries _userQueries;
    private readonly EmailTemplateQueries _templateQueries;
    private readonly EmailMilestoneProgressQueries _progressQueries;
    private readonly IEmailService _emailService;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<ScheduledEmailService> _logger;

    public ScheduledEmailService(
        EventScheduleQueries scheduleQueries,
        UserQueries userQueries,
        EmailTemplateQueries templateQueries,
        EmailMilestoneProgressQueries progressQueries,
        IEmailService emailService,
        IOptions<EmailSettings> emailSettings,
        ILogger<ScheduledEmailService> logger)
    {
        _scheduleQueries = scheduleQueries;
        _userQueries = userQueries;
        _templateQueries = templateQueries;
        _progressQueries = progressQueries;
        _emailService = emailService;
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    public async Task ProcessMilestonesAsync(CancellationToken ct)
    {
        var scheduleResult = await _scheduleQueries.GetAsync(ct);
        if (scheduleResult.IsError)
            return;

        var schedule = scheduleResult.Value;
        var nowUtc = DateTimeOffset.UtcNow;
        var eventId = _emailSettings.DefaultEventId;
        var maxMilestoneAge = TimeSpan.FromHours(_emailSettings.MaxMilestoneAgeHours);

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

            var completedResult = await _progressQueries.IsCompletedAsync(eventId, milestone.Key, ct);
            if (completedResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId, completedResult.Error);
                return;
            }

            if (completedResult.Value)
                continue;

            if (nowUtc - milestone.At > maxMilestoneAge)
            {
                _logger.LogInformation(
                    LogMessages.Email.SCHEDULED_MILESTONE_SKIPPED,
                    milestone.Key,
                    eventId,
                    milestone.At);

                var skipMarkResult = await _progressQueries.MarkCompletedAsync(eventId, milestone.Key, DateTime.UtcNow, ct);
                if (skipMarkResult.IsError)
                {
                    _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId, skipMarkResult.Error);
                    return;
                }

                continue;
            }

            var templateResult = await _templateQueries.GetByKeyAsync(milestone.Key, ct);
            if (templateResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId, templateResult.Error);

                if (templateResult.Error == ErrorType.EMAIL_TEMPLATE_NOT_FOUND)
                    continue;

                return;
            }

            var usersResult = await _userQueries.GetActiveEmailRecipientsAsync(ct);
            if (usersResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId, usersResult.Error);
                return;
            }

            foreach (var user in usersResult.Value)
            {
                var variables = new Dictionary<string, string>
                {
                    ["recipientName"] = EmailTemplateHelper.BuildRecipientName(user.FirstName, user.LastName)
                };

                var deduplicationKey = $"{eventId}:{milestone.Key}:user:{user.Id}";
                var enqueueResult = await _emailService.EnqueueTemplatedAsync(
                    templateResult.Value,
                    user.Email,
                    variables,
                    deduplicationKey,
                    ct);

                if (enqueueResult.IsError)
                {
                    if (enqueueResult.Error is ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID or ErrorType.EMAIL_RECIPIENT_MISSING)
                    {
                        _logger.LogWarning(
                            LogMessages.Email.SCHEDULED_RECIPIENT_SKIPPED,
                            user.Id,
                            milestone.Key,
                            eventId,
                            enqueueResult.Error);
                        continue;
                    }

                    _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId, enqueueResult.Error);
                    return;
                }
            }

            var markResult = await _progressQueries.MarkCompletedAsync(eventId, milestone.Key, DateTime.UtcNow, ct);
            if (markResult.IsError)
            {
                _logger.LogError(LogMessages.Email.SCHEDULED_MILESTONE_FAILED, milestone.Key, eventId, markResult.Error);
                return;
            }
        }
    }
}