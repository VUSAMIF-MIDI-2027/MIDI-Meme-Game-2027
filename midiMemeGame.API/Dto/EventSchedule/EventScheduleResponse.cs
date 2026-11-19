namespace MidiMemeGame.Api.Dto.EventSchedule;

public class EventScheduleResponse
{
    public DateTimeOffset EventStartsAt { get; set; }
    public DateTimeOffset VotingStartsAt { get; set; }
    public DateTimeOffset EventEndsAt { get; set; }
}
