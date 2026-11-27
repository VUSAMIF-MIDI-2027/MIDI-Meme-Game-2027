using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
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
        private readonly ResultPublicationQueries _resultPublicationQueries;
        private readonly EventPhaseService _eventScheduleService;

        public PhotosController(
            SourcePhotoQueries sourcePhotoQueries, 
            PhotoFileService photoFiles,
            EventPhaseService eventPhaseService,
            ResultPublicationQueries resultPublicationQueries)
        {
            _sourcePhotoQueries = sourcePhotoQueries;
            _photoFiles = photoFiles;
            _eventScheduleService = eventPhaseService;
            _resultPublicationQueries = resultPublicationQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetPhotos(
            CancellationToken cancellationToken)
        {
            var result = await _sourcePhotoQueries.GetAllAsync(
                IsEnabled: true,
                cancellationToken: cancellationToken);

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));

            return Ok(result.Value.Select(photo => new PhotoResponse
            {
                Id = photo.Id
            }));
        }

        [HttpGet("{id:int}/file")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPhotoFile(
            int id,
            CancellationToken cancellationToken)
        {
            Response.Headers.CacheControl = "no-store";

            if (User.Identity?.IsAuthenticated != true)
            {
                var eventResult = await _eventScheduleService.EnsureEventEndedAsync(cancellationToken);

                if (eventResult.IsError)
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        ErrorResponse.Create(eventResult.Error));
                }

                var isPublic = await _resultPublicationQueries.GetPublicResults(DateTime.UtcNow)
                    .AnyAsync(row => row.SourcePhotoId == id, cancellationToken);
                if (!isPublic)
                    return NotFound(ErrorResponse.Create(ErrorType.NOT_FOUND));
            }

            var photoResult = await _sourcePhotoQueries.GetByIdAsync(id, cancellationToken);

            if (photoResult.IsError)
            {
                if (photoResult.Error == ErrorType.NOT_FOUND)
                    return NotFound(ErrorResponse.Create(photoResult.Error));

                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(photoResult.Error));
            }

            var photo = photoResult.Value;
            var pathResult = _photoFiles.ResolvePath(photo.RelativeFilePath);

            if (pathResult.IsError)
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(pathResult.Error));

            if (!System.IO.File.Exists(pathResult.Value))
                return NotFound(ErrorResponse.Create(ErrorType.NOT_FOUND));

            // Revalidate access on every request before reusing the cached photo.
            Response.Headers.CacheControl = "private, no-cache";
            return PhysicalFile(
                pathResult.Value,
                photo.ContentType,
                lastModified: null,
                entityTag: new EntityTagHeaderValue($"\"{photo.FileId}\""));
        }
    }
}
