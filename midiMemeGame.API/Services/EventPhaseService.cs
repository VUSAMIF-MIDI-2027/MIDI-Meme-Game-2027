using System;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;

namespace MidiMemeGame.Api.Services;

public class EventPhaseService
{
    private readonly EventScheduleQueries _scheduleQueries;
    private readonly ILogger<EventPhaseService> _logger;
    public EventPhaseService(
        EventScheduleQueries scheduleQueries,
        ILogger<EventPhaseService> logger
    )
    {
        _logger = logger;
        _scheduleQueries = scheduleQueries;
    }
    public async Task<Result> EnsureSubmissionsOpenAsync(CancellationToken cancellationToken)
    {
        var schedule = await _scheduleQueries.GetAsync(cancellationToken);

        if (schedule.IsError)
            return schedule.Error;

        var now = DateTimeOffset.UtcNow;

        if (now < schedule.Value.EventStartsAt)
        {
            _logger.LogWarning(LogMessages.EventSchedule.MEME_SUBMISSIONS_NOT_OPEN, now, schedule.Value.EventStartsAt);
            return ErrorType.MEME_SUBMISSIONS_NOT_OPEN;
        }

        if (now >= schedule.Value.VotingStartsAt)
        {
            _logger.LogWarning(LogMessages.EventSchedule.MEME_SUBMISSIONS_CLOSED, now, schedule.Value.EventStartsAt);
            return ErrorType.MEME_SUBMISSIONS_CLOSED;
        }

        return Result.Ok();
    }
}
