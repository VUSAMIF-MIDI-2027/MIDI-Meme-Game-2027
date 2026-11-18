using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;

namespace MidiMemeGame.Api.Controllers
{
    [ApiController]
    [Route("api/photos")]
    [Authorize]
    public class PhotosController : ControllerBase
    {
        private readonly SourcePhotoQueries _sourcePhotoQueries;

        public PhotosController(SourcePhotoQueries sourcePhotoQueries)
        {
            _sourcePhotoQueries = sourcePhotoQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetPhotos(
            CancellationToken cancellationToken)
        {
            var result = await _sourcePhotoQueries.GetAllAsync(
                IsEnabled: true,
                cancellationToken: cancellationToken);

            if (result.IsError)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));
            }

            return Ok(result.Value);
        }
    }
}
