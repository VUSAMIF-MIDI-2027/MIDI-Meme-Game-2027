using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Photos;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly SourcePhotoQueries _sourcePhotoQueries;
        private readonly PhotoFileService _photoFiles;

        public AdminController(SourcePhotoQueries sourcePhotoQueries, PhotoFileService photoFiles)
        {
            _sourcePhotoQueries = sourcePhotoQueries;
            _photoFiles = photoFiles;
        }

        [HttpPost("photos")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadPhoto(
            IFormFile? file,
            CancellationToken cancellationToken)
        {
            if (file == null)
                return BadRequest(ErrorResponse.Create(ErrorType.PHOTO_FILE_EMPTY));

            var fileResult = await _photoFiles.SaveUploadAsync(
                file,
                cancellationToken);

            if (fileResult.IsError)
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(fileResult.Error));

            var savedFile = fileResult.Value;

            var photo = new SourcePhoto
            {
                FileId = savedFile.FileId,
                RelativeFilePath = savedFile.RelativePath,
                OriginalFileName = Path.GetFileName(file.FileName.Replace('\\', '/')),
                ContentType = savedFile.ContentType,
                SizeBytes = file.Length,
                IsEnabled = true
            };

            var photoResult = await _sourcePhotoQueries.AddAsync(photo, cancellationToken);

            if (photoResult.IsError)
            {
                _photoFiles.Delete(savedFile.RelativePath);

                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(photoResult.Error));
            }

            var createdPhoto = photoResult.Value;

            return Ok(
                new AdminPhotoResponse
                {
                    Id = createdPhoto.Id,
                    IsEnabled = createdPhoto.IsEnabled
                });
        }

        [HttpGet("photos")]
        public async Task<IActionResult> GetPhotos(bool? isEnabled, CancellationToken cancellationToken)
        {
            var result = await _sourcePhotoQueries.GetAllAsync(
                isEnabled,
                cancellationToken);

            if (result.IsError)
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));

            return Ok(result.Value.Select(photo => new AdminPhotoResponse
            {
                Id = photo.Id,
                IsEnabled = photo.IsEnabled
            }));
        }

        [HttpPatch("photos/{id:int}")]
        public async Task<IActionResult> UpdatePhotoEnabled(
            int id,
            [FromBody] UpdatePhotoEnabledRequest request,
            CancellationToken cancellationToken)
        {
            if (request.IsEnabled == null)
                return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

            var result = await _sourcePhotoQueries.UpdateEnabledAsync(
                id,
                request.IsEnabled.Value,
                cancellationToken);

            if (result.IsError)
            {
                if (result.Error == ErrorType.NOT_FOUND)
                    return NotFound(ErrorResponse.Create(result.Error));

                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));
            }

            return Ok(new AdminPhotoResponse
            {
                Id = result.Value.Id,
                IsEnabled = result.Value.IsEnabled
            });
        }
    }
}
