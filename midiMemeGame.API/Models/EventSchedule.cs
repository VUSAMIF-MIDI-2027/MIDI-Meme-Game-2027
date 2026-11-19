namespace MidiMemeGame.Api.Models;

public class EventSchedule
{
    // The table holds at most one row; a CHECK constraint enforces this id.
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;
    public DateTimeOffset EventStartsAt { get; set; }
    public DateTimeOffset VotingStartsAt { get; set; }
    public DateTimeOffset EventEndsAt { get; set; }
}
