using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Memes.Results;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class AdminResultController : ControllerBase
    {
        private readonly ResultPublicationService _resultPublicationService;
        public AdminResultController(ResultPublicationService resultPublicationService)
        {
            _resultPublicationService = resultPublicationService;
        }
        [HttpPost("results/publish")]
        public async Task<IActionResult> PublishResults(
            [FromBody] PublishResultsRequestDto request,
            CancellationToken cancellationToken)
        {
            var result = await _resultPublicationService.PublishAsync(
                request.PodiumMemeIds, cancellationToken);

            if (result.IsSuccess)
                return NoContent();

            var error = ErrorResponse.Create(result.Error, result.ErrorMessage);

            return result.Error switch
            {
                ErrorType.BAD_REQUEST => BadRequest(error),
                ErrorType.RESULTS_NOT_AVAILABLE => Conflict(error),
                ErrorType.RESULTS_ALREADY_PUBLISHED => Conflict(error),
                ErrorType.EMAIL_RECIPIENT_MISSING => UnprocessableEntity(error),
                ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID => UnprocessableEntity(error),
                ErrorType.EVENT_SCHEDULE_NOT_FOUND => NotFound(error),
                _ => StatusCode(StatusCodes.Status500InternalServerError, error)
            };
        }
        [HttpDelete("results/publication")]
        public async Task<IActionResult> UnpublishResults(CancellationToken cancellationToken)
        {
            var result = await _resultPublicationService.UnpublishAsync(
                cancellationToken);

            if (result.IsSuccess)
                return NoContent();

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error, result.ErrorMessage));
        }
        [HttpGet("results")]
        public async Task<IActionResult> GetResults(CancellationToken cancellationToken)
        {
            var result = await _resultPublicationService.GetAdminResultsAsync(
                cancellationToken);

            if (result.IsSuccess)
                return Ok(result.Value);

            var error = ErrorResponse.Create(result.Error, result.ErrorMessage);

            return result.Error switch
            {
                ErrorType.RESULTS_NOT_AVAILABLE => Conflict(error),
                ErrorType.EVENT_SCHEDULE_NOT_FOUND => NotFound(error),
                _ => StatusCode(StatusCodes.Status500InternalServerError, error)
            };
        }
    }
}
