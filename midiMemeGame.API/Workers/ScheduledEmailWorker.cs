using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Workers;

public class ScheduledEmailWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<ScheduledEmailWorker> _logger;

    public ScheduledEmailWorker(
        IServiceScopeFactory scopeFactory,
        IOptions<EmailSettings> emailSettings,
        ILogger<ScheduledEmailWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var pollInterval = TimeSpan.FromSeconds(_emailSettings.ScheduledPollIntervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (!DeploymentSlot.IsActive())
                {
                    await Task.Delay(pollInterval, stoppingToken);
                    continue;
                }
                using var scope = _scopeFactory.CreateScope();
                var scheduledEmailService = scope.ServiceProvider.GetRequiredService<IScheduledEmailService>();
                await scheduledEmailService.ProcessMilestonesAsync(stoppingToken);
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
                await Task.Delay(pollInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
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