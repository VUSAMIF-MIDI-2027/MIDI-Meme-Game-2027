using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Users;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserQueries _userQueries;
        private readonly SourcePhotoQueries _sourcePhotoQueries;
        private readonly ClerkUserService _clerkUserService;

        public AdminController(
            UserQueries userQueries,
            SourcePhotoQueries sourcePhotoQueries,
            ClerkUserService clerkUserService)
        {
            _userQueries = userQueries;
            _sourcePhotoQueries = sourcePhotoQueries;
            _clerkUserService = clerkUserService;
        }

        [HttpGet("users/lookup")]
        [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
        public async Task<IActionResult> LookupUser([FromQuery] UserLookupRequest request, CancellationToken cancellationToken)
        {
            var result = await _userQueries.FindActiveByEmailAsync(request.Email.Trim(), cancellationToken);

            if (result.Error == ErrorType.NOT_FOUND)
                return NotFound(ErrorResponse.Create(result.Error));

            if (result.Error == ErrorType.BAD_REQUEST)
                return Conflict(ErrorResponse.Create(result.Error));

            if (result.IsError)
                return StatusCode(StatusCodes.Status500InternalServerError, ErrorResponse.Create(result.Error));

            return Ok(result.Value);
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
        [HttpPost("users/reset-rules-acknowledgements")]
        public async Task<IActionResult> ResetRulesAcknowledgements(CancellationToken cancellationToken)
        {
            var result = await _userQueries.ResetRulesAcknowledgementsAsync(
                cancellationToken);

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));

            return Ok(new { updatedUsers = result.Value });
        }
        [HttpPost("users/{userId:int}/grant-admin")]
        public async Task<IActionResult> GrantAdmin(
            int userId,
            CancellationToken cancellationToken)
        {
            if (userId <= 0)
                return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

            var result = await _clerkUserService.GrantAdminAsync(
                userId,
                cancellationToken);

            if (result.Error == ErrorType.NOT_FOUND)
                return NotFound(ErrorResponse.Create(result.Error));

            if (result.Error == ErrorType.CLERK_API_UNAVAILABLE)
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    ErrorResponse.Create(result.Error));

            if (result.IsError)
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ErrorResponse.Create(result.Error));

            return NoContent();
        }
    }
}
