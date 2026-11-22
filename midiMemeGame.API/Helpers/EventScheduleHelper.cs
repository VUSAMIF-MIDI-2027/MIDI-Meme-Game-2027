using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Helpers;

public static class EventScheduleHelper
{
    public static EventSchedule ToUtc(EventSchedule schedule) => new()
    {
        EventStartsAt = schedule.EventStartsAt.ToUniversalTime(),
        VotingStartsAt = schedule.VotingStartsAt.ToUniversalTime(),
        EventEndsAt = schedule.EventEndsAt.ToUniversalTime()
    }; 

    // Compared in memory: SQLite cannot translate DateTimeOffset comparisons in LINQ.
    public static bool IsChronological(EventSchedule schedule) =>
        schedule.EventStartsAt < schedule.VotingStartsAt
        && schedule.VotingStartsAt < schedule.EventEndsAt;
}
