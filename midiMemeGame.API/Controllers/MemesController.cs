using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Memes;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/memes")]
    [ApiController]
    [Authorize]
    public class MemesController : ControllerBase
    {
        private readonly MemeService _memeService;
        public MemesController(MemeService memeService)
        {
            _memeService = memeService;
        }
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] MemeRequestDto request,
            CancellationToken cancellationToken
        )
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized(ErrorResponse.Create(ErrorType.USER_ACCESS_DENIED));

            var result = await _memeService.CreateAsync(clerkId, request, cancellationToken);

            if (result.IsError)
                return MapMemeMutationError(result.Error);

            if (!result.TryGetResult(out var meme))
                return NotFound(ErrorResponse.Create(ErrorType.NOT_FOUND));

            return Ok(new OwnMemeResponseDto
            {
                Id = meme.Id,
                SourcePhotoId = int.Parse(meme.SourcePhotoId, CultureInfo.InvariantCulture),
                Caption = meme.Caption,
                GalleryPublicationAccepted = meme.GalleryPublicationAccepted,
                PublishMeme = meme.MemePublicationConsentedAtUtc != null && meme.MemePublicationWithdrawnAtUtc == null,
                PublishName = meme.NamePublicationConsentedAtUtc != null && meme.NamePublicationWithdrawnAtUtc == null
                    && meme.MemePublicationWithdrawnAtUtc == null,
                StatusId = (int)meme.StatusId,
                Score = meme.Score,
                CreatedAtUtc = meme.CreatedAtUtc,
                UpdatedAtUtc = meme.UpdatedAtUtc,
                IsInvalidatedBySourcePhoto = meme.IsInvalidatedBySourcePhoto
            });
        }

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateMemeRequestDto request,
            CancellationToken cancellationToken)
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized(ErrorResponse.Create(ErrorType.USER_ACCESS_DENIED));

            var result = await _memeService.UpdateAsync(id, clerkId, request.Caption, cancellationToken);

            if (result.IsError)
                return MapMemeMutationError(result.Error);

            if (!result.TryGetResult(out var meme))
                return NotFound(ErrorResponse.Create(ErrorType.NOT_FOUND));

            return Ok(new OwnMemeResponseDto
            {
                Id = meme.Id,
                SourcePhotoId = int.Parse(meme.SourcePhotoId, CultureInfo.InvariantCulture),
                Caption = meme.Caption,
                GalleryPublicationAccepted = meme.GalleryPublicationAccepted,
                PublishMeme = meme.MemePublicationConsentedAtUtc != null && meme.MemePublicationWithdrawnAtUtc == null,
                PublishName = meme.NamePublicationConsentedAtUtc != null && meme.NamePublicationWithdrawnAtUtc == null
                    && meme.MemePublicationWithdrawnAtUtc == null,
                StatusId = (int)meme.StatusId,
                Score = meme.Score,
                CreatedAtUtc = meme.CreatedAtUtc,
                UpdatedAtUtc = meme.UpdatedAtUtc,
                IsInvalidatedBySourcePhoto = meme.IsInvalidatedBySourcePhoto
            });
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized();

            var result = await _memeService.DeleteAsync(id, clerkId, cancellationToken);

            if (result.Error == ErrorType.NOT_FOUND)
                return NotFound(ErrorResponse.Create(ErrorType.NOT_FOUND));

            if (result.IsError)
                return MapMemeMutationError(result.Error);

            return Ok();
        }
        [HttpDelete("{id:int}/publication")]
        public async Task<IActionResult> WithdrawPublication(
            int id, CancellationToken cancellationToken, [FromQuery] bool nameOnly = false)
        {
            var clerkId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized(ErrorResponse.Create(ErrorType.USER_ACCESS_DENIED));

            var result = await _memeService.WithdrawPublicationAsync(id, clerkId, nameOnly, cancellationToken);
            return result.IsError ? MapMemeMutationError(result.Error) : NoContent();
        }

        [HttpPut("{id:int}/publication/name")]
        public async Task<IActionResult> SetNamePublication(
            int id, [FromBody] bool publishName, CancellationToken cancellationToken)
        {
            var clerkId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized(ErrorResponse.Create(ErrorType.USER_ACCESS_DENIED));

            var result = await _memeService.SetNamePublicationAsync(id, clerkId, publishName, cancellationToken);
            return result.IsError ? MapMemeMutationError(result.Error) : NoContent();
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyMemes(CancellationToken cancellationToken)
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized();

            var result = await _memeService.GetMineMemesAsync(clerkId, cancellationToken);

            if (result.Error == ErrorType.USER_ACCESS_DENIED)
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    ErrorResponse.Create(result.Error));

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));

            return Ok(result.Value);
        }

        private IActionResult MapMemeMutationError(ErrorType errorType)
        {
            var error = ErrorResponse.Create(errorType);
            return errorType switch
            {
                ErrorType.BAD_REQUEST => BadRequest(error),
                ErrorType.NOT_FOUND => NotFound(error),
                ErrorType.USER_ACCESS_DENIED => StatusCode(StatusCodes.Status403Forbidden, error),
                ErrorType.MEME_LIMIT_REACHED or ErrorType.MEME_SOURCE_PHOTO_DISABLED
                    or ErrorType.MEME_SUBMISSIONS_NOT_OPEN or ErrorType.MEME_SUBMISSIONS_CLOSED
                    => Conflict(error),
                _ => StatusCode(StatusCodes.Status500InternalServerError, error)
            };
        }
    }
}
