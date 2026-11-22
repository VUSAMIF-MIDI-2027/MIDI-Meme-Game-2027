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
        public Task<IActionResult> Create(
            [FromBody] MemeRequestDto request,
            CancellationToken cancellationToken
        )
        {
            return SaveAsync(null, request, cancellationToken);
        }

        [HttpPatch("{id:int:min(1)}")]
        public Task<IActionResult> Update(
            int id,
            [FromBody] MemeRequestDto request,
            CancellationToken cancellationToken)
        {
            return SaveAsync(id, request, cancellationToken);
        }
        [HttpDelete("{id:int:min(1)}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized();

            var result = await _memeService.DeleteAsync(id, clerkId, cancellationToken);

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));

            return Ok();
        }
        [HttpGet("mine")]
        public async Task<IActionResult> GetMineMemes(CancellationToken cancellationToken)
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

        private async Task<IActionResult> SaveAsync(
            int? memeId,
            MemeRequestDto request,
            CancellationToken cancellationToken
        )
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized();

            var result = await _memeService.SaveAsync(
                memeId, clerkId, request, cancellationToken);

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));

            var meme = result.Value;
            var response = new
            {
                meme.Id,
                request.SourcePhotoId,
                meme.Caption,
                meme.StatusId,
                meme.Score,
                meme.CreatedAtUtc,
                meme.UpdatedAtUtc
            };

            if (memeId.HasValue)
                return Ok(response);

            return StatusCode(StatusCodes.Status201Created, response);
        }
    }
}
