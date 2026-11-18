using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;

namespace MidiMemeGame.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly SourcePhotoQueries _sourcePhotoQueries;

        public AdminController(SourcePhotoQueries sourcePhotoQueries)
        {
            _sourcePhotoQueries = sourcePhotoQueries;
        }

        [HttpGet("photos")]
        public async Task<IActionResult> GetPhotos(
            bool isEnabled,
            CancellationToken cancellationToken)
        {
            var result = await _sourcePhotoQueries.GetAllAsync(
                isEnabled,
                cancellationToken);

            if (result.IsError)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));
            }

            return Ok(result.Value);
        }
    }
}
