using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Photos;
using MidiMemeGame.Api.Services;
using MidiMemeGame.Api.Common.Enums;

namespace MidiMemeGame.Api.Controllers
{
    [ApiController]
    [Route("api/photos")]
    [Authorize]
    public class PhotosController : ControllerBase
    {
        private readonly SourcePhotoQueries _sourcePhotoQueries;
        private readonly PhotoFileService _photoFiles;

        public PhotosController(SourcePhotoQueries sourcePhotoQueries, PhotoFileService photoFiles)
        {
            _sourcePhotoQueries = sourcePhotoQueries;
            _photoFiles = photoFiles;
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

            return Ok(result.Value.Select(PhotoResponse.From));
        }

        [HttpGet("{id:int}/file")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPhotoFile(int id, CancellationToken cancellationToken)
        {
            var result = await _sourcePhotoQueries.GetFileAccessAsync(
                id, User.Identity?.IsAuthenticated == true, cancellationToken);
            if (result.IsError) return result.Error == ErrorType.NOT_FOUND
                ? NotFound(ErrorResponse.Create(result.Error))
                : StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));
            try
            {
                var path = _photoFiles.ResolvePath(result.Value.RelativeFilePath);
                if (!System.IO.File.Exists(path)) return NotFound(ErrorResponse.Create(ErrorType.NOT_FOUND, "The photo file is missing."));
                return PhysicalFile(path, result.Value.ContentType);
            }
            catch (InvalidDataException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(ErrorType.INTERNAL_SERVER_ERROR));
            }
        }
    }
}
