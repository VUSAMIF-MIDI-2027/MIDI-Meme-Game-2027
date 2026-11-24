namespace MidiMemeGame.Api.Services.Interfaces;

public interface IScheduledEmailService
{
    Task ProcessMilestonesAsync(CancellationToken ct);
}