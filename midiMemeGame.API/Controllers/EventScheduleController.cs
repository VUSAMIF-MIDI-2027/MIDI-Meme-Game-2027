using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.EventSchedule;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Controllers;

// GET endpoints are public; only the PUT endpoints require the admin role.
[ApiController]
[Route("api/event-schedule")]
public class EventScheduleController : ControllerBase
{
    private readonly EventScheduleQueries _eventScheduleQueries;

    public EventScheduleController(EventScheduleQueries eventScheduleQueries)
    {
        _eventScheduleQueries = eventScheduleQueries;
    }

    [HttpGet]
    public Task<IActionResult> GetSchedule(CancellationToken cancellationToken) =>
        GetAsync(ToScheduleResponse, cancellationToken);

    [HttpPut]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutSchedule(
        [FromBody] EventScheduleRequest request,
        CancellationToken cancellationToken)
    {
        if (request.EventStartsAt == null
            || request.VotingStartsAt == null
            || request.EventEndsAt == null)
            return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

        var schedule = new EventSchedule
        {
            EventStartsAt = request.EventStartsAt.Value,
            VotingStartsAt = request.VotingStartsAt.Value,
            EventEndsAt = request.EventEndsAt.Value
        };

        return await SaveAsync(schedule, ToScheduleResponse, cancellationToken);
    }


    private async Task<IActionResult> GetAsync(
        Func<EventSchedule, object> toResponse,
        CancellationToken cancellationToken)
    {
        var result = await _eventScheduleQueries.GetAsync(cancellationToken);

        if (result.Error == ErrorType.EVENT_SCHEDULE_NOT_FOUND)
            return NotFound(ErrorResponse.Create(result.Error));

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(toResponse(result.Value));
    }

    // Applies one new timestamp to the stored schedule, then validates it against the other two.
    private async Task<IActionResult> SaveAsync(
        EventSchedule schedule,
        Func<EventSchedule, object> toResponse,
        CancellationToken cancellationToken)
    {
        var utcSchedule = EventScheduleHelper.ToUtc(schedule);

        if (!EventScheduleHelper.IsChronological(utcSchedule))
            return BadRequest(ErrorResponse.Create(ErrorType.EVENT_SCHEDULE_INVALID_ORDER));

        var result = await _eventScheduleQueries.UpsertAsync(
            utcSchedule,
            cancellationToken);

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(toResponse(result.Value));
    }

    private static EventScheduleResponse ToScheduleResponse(EventSchedule schedule) => new()
    {
        EventStartsAt = schedule.EventStartsAt,
        VotingStartsAt = schedule.VotingStartsAt,
        EventEndsAt = schedule.EventEndsAt
    };
}
