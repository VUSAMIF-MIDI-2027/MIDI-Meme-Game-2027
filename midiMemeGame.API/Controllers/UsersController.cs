using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ClerkUserService _clerkUserService;

        public UsersController(ClerkUserService clerkUserService)
        {
            _clerkUserService = clerkUserService;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> Sync(
            CancellationToken cancellationToken
        )
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return Unauthorized();

            var result = await _clerkUserService.SyncAsync(
                clerkId,
                cancellationToken
            );

            if (result.Error == ErrorType.NOT_FOUND)
                return NotFound(ErrorResponse.Create(result.Error));

            if (result.Error == ErrorType.USER_ACCESS_DENIED)
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    ErrorResponse.Create(result.Error)
                );

            if (result.Error == ErrorType.CLERK_API_UNAVAILABLE)
                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    ErrorResponse.Create(result.Error)
                );

            if (result.Error == ErrorType.CLERK_PAYLOAD_INVALID || result.Error == ErrorType.CLERK_USER_DATA_INVALID)
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    ErrorResponse.Create(result.Error)
                );

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error)
                );

            return Ok(new { userId = result.Value });
        }
    }
}
