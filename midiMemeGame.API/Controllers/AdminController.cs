using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Photos;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Services;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Models.Settings;

namespace MidiMemeGame.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly SourcePhotoQueries _sourcePhotoQueries;
        private readonly PhotoFileService _photoFiles;
        private readonly PhotoUploadSettings _uploadSettings;

        public AdminController(SourcePhotoQueries sourcePhotoQueries, PhotoFileService photoFiles, IOptions<PhotoUploadSettings> uploadSettings)
        {
            _sourcePhotoQueries = sourcePhotoQueries;
            _photoFiles = photoFiles;
            _uploadSettings = uploadSettings.Value;
        }

        [HttpPost("photos")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(11534336)]
        public async Task<IActionResult> UploadPhoto(IFormFile? file, CancellationToken cancellationToken)
        {
            if (file is null || file.Length <= 0) return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST, "An image file is required."));
            if (file.Length > _uploadSettings.MaxFileSizeBytes) return StatusCode(StatusCodes.Status413PayloadTooLarge, ErrorResponse.Create(ErrorType.BAD_REQUEST, "The image exceeds the maximum file size."));

            string? relativePath = null;
            try
            {
                var saved = await _photoFiles.SaveUploadAsync(file, cancellationToken);
                if (saved is null) return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST, "The file is not an allowed image type."));
                relativePath = saved.Value.RelativePath;
                var photo = new SourcePhoto
                {
                    FileId = Guid.NewGuid().ToString("N")[..12],
                    RelativeFilePath = saved.Value.RelativePath,
                    OriginalFileName = Path.GetFileName(file.FileName.Replace('\\', '/')),
                    ContentType = saved.Value.ContentType,
                    SizeBytes = file.Length,
                    IsEnabled = true
                };
                var result = await _sourcePhotoQueries.AddAsync(photo, cancellationToken);
                if (result.IsError)
                {
                    _photoFiles.Delete(relativePath);
                    return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));
                }
                return CreatedAtAction(nameof(GetPhotos), new { isEnabled = true }, PhotoResponse.From(photo));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                if (relativePath is not null) _photoFiles.Delete(relativePath);
                throw;
            }
            catch (Exception)
            {
                if (relativePath is not null) _photoFiles.Delete(relativePath);
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(ErrorType.INTERNAL_SERVER_ERROR));
            }
        }

        [HttpGet("photos")]
        public async Task<IActionResult> GetPhotos(
            bool? isEnabled,
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

            return Ok(result.Value.Select(PhotoResponse.From));
        }

        [HttpPatch("photos/{id:int}")]
        public async Task<IActionResult> UpdatePhoto(int id, [FromBody] UpdatePhotoRequest request, CancellationToken cancellationToken)
        {
            if (request.IsEnabled is null) return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST, "isEnabled is required."));
            var result = await _sourcePhotoQueries.UpdateEnabledAsync(id, request.IsEnabled.Value, cancellationToken);
            if (result.IsError) return result.Error == ErrorType.NOT_FOUND
                ? NotFound(ErrorResponse.Create(result.Error))
                : StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));
            return Ok(PhotoResponse.From(result.Value));
        }
    }
}
