using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class ResultsController : ControllerBase
    {
        private readonly EventPhaseService _eventPhase;
        private readonly MemeQueries _memeQueries;

        public ResultsController(
            EventPhaseService eventPhase,
            MemeQueries memeQueries)
        {
            _eventPhase = eventPhase;
            _memeQueries = memeQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetResults(CancellationToken cancellationToken)
        {
            var phase = await _eventPhase.EnsureEventEndedAsync(cancellationToken);

            if (phase.Error == ErrorType.RESULTS_NOT_AVAILABLE)
                return Conflict(ErrorResponse.Create(phase.Error));

            if (phase.Error == ErrorType.EVENT_SCHEDULE_NOT_FOUND)
                return NotFound(ErrorResponse.Create(phase.Error));

            if (phase.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(phase.Error));

            var result = await _memeQueries.GetResultsAsync(cancellationToken);

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));

            return Ok(result.Value);
        }
    }
}
