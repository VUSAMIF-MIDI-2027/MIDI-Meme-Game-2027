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
        public async Task<IActionResult> GetResults(CancellationToken cancellationToken)
        {
            var phase = await _eventPhase.EnsureEventEndedAsync(cancellationToken);

            if (phase.Error == ErrorType.EVENT_SCHEDULE_NOT_FOUND)
                return NotFound(ErrorResponse.Create(phase.Error));

            if (phase.Error == ErrorType.RESULTS_NOT_AVAILABLE)
                return Conflict(ErrorResponse.Create(phase.Error));

            if (phase.IsError)
                return StatusCode(500, ErrorResponse.Create(phase.Error));
            
            var result = await _resultPublicationQueries.GetPublicAsync(cancellationToken);

            if (result.IsSuccess)
                return Ok(result.Value);

            if (result.Error != ErrorType.RESULTS_NOT_PUBLISHED)
                return StatusCode(500, ErrorResponse.Create(result.Error));

            return Conflict(ErrorResponse.Create(ErrorType.RESULTS_NOT_PUBLISHED));
        }
    }
}
