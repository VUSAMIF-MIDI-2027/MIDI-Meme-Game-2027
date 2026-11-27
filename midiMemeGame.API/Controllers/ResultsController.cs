using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/results")]
    [ApiController]
    [AllowAnonymous]
    public class ResultsController : ControllerBase
    {
        private readonly EventPhaseService _eventPhase;
        private readonly ResultPublicationService _resultPublicationQueries;

        public ResultsController(
            EventPhaseService eventPhase,
            ResultPublicationService resultPublicationService)
        {
            _eventPhase = eventPhase;
            _resultPublicationQueries = resultPublicationService;
        }

        [HttpGet]
        public Task<IActionResult> GetResults(CancellationToken cancellationToken) =>
            ReadResultsAsync(0, null, cancellationToken);

        [HttpGet("page")]
        public async Task<IActionResult> GetResultsPage(
            CancellationToken cancellationToken,
            [FromQuery] int afterPlace = 0,
            [FromQuery] int limit = 15)
        {
            if (afterPlace < 0 || limit is < 1 or > 48)
                return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

            return await ReadResultsAsync(afterPlace, limit, cancellationToken);
        }

        private async Task<IActionResult> ReadResultsAsync(
            int afterPlace, int? limit, CancellationToken cancellationToken)
        {
            Response.Headers.CacheControl = "no-store";

            var phase = await _eventPhase.EnsureEventEndedAsync(cancellationToken);

            if (phase.Error == ErrorType.EVENT_SCHEDULE_NOT_FOUND)
                return NotFound(ErrorResponse.Create(phase.Error));

            if (phase.Error == ErrorType.RESULTS_NOT_AVAILABLE)
                return Conflict(ErrorResponse.Create(phase.Error));

            if (phase.IsError)
                return StatusCode(500, ErrorResponse.Create(phase.Error));
            
            var result = await _resultPublicationQueries.GetPublicAsync(afterPlace, limit, cancellationToken);

            if (result.IsSuccess)
                return limit.HasValue ? Ok(result.Value) : Ok(result.Value.Items);

            if (result.Error != ErrorType.RESULTS_NOT_PUBLISHED)
                return StatusCode(500, ErrorResponse.Create(result.Error));

            return Conflict(ErrorResponse.Create(ErrorType.RESULTS_NOT_PUBLISHED));
        }
    }
}
