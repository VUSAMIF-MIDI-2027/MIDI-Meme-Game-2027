using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Workers;

public class ScheduledEmailWorker : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);

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
                await CheckSchedulesAsync(stoppingToken);
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
                await Task.Delay(PollInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task CheckSchedulesAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

        var now = DateTime.UtcNow;

        var schedule = await dbContext.EventSchedules
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (schedule is null)
            return;

        var recipients = await dbContext.Users
            .AsNoTracking()
            .Where(u => !string.IsNullOrWhiteSpace(u.Email))
            .Select(u => new { u.Id, u.Email, u.FirstName })
            .ToListAsync(cancellationToken);

        if (recipients.Count == 0)
            return;

        if (schedule.EventStartsAt <= now)
        {
            await EnqueueBroadcastAsync(
                emailService,
                EmailTemplateKeys.EventStarted,
                $"event-started:{schedule.Id}",
                recipients.Select(r => (r.Id, r.Email, r.FirstName)),
                cancellationToken);
        }

        if (schedule.VotingStartsAt <= now)
        {
            await EnqueueBroadcastAsync(
                emailService,
                EmailTemplateKeys.VotingOpened,
                $"voting-started:{schedule.Id}",
                recipients.Select(r => (r.Id, r.Email, r.FirstName)),
                cancellationToken);
        }

        if (schedule.EventEndsAt <= now)
        {
            await EnqueueBroadcastAsync(
                emailService,
                EmailTemplateKeys.EventEnded,
                $"event-ended:{schedule.Id}",
                recipients.Select(r => (r.Id, r.Email, r.FirstName)),
                cancellationToken);
        }
    }

    private static async Task EnqueueBroadcastAsync(
        EmailService emailService,
        string templateKey,
        string eventScopeKey,
        IEnumerable<(int Id, string Email, string FirstName)> recipients,
        CancellationToken cancellationToken)
    {
        foreach (var recipient in recipients)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            var variables = new Dictionary<string, string>
            {
                ["recipientName"] = string.IsNullOrWhiteSpace(recipient.FirstName) ? "Player" : recipient.FirstName
            };

            var deduplicationKey = $"{eventScopeKey}:user:{recipient.Id}";

            await emailService.EnqueueTemplatedAsync(
                templateKey,
                recipient.Email,
                variables,
                deduplicationKey,
                cancellationToken);
        }
    }
}