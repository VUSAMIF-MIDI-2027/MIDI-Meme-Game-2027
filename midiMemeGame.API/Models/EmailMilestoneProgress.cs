namespace MidiMemeGame.Api.Models;

public class EmailMilestoneProgress
{
    public string EventId { get; set; } = string.Empty;
    public string Milestone { get; set; } = string.Empty;
    public DateTime QueuedAtUtc { get; set; }
}