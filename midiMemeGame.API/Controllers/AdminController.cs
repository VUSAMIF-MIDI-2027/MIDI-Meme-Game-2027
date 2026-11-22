using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Photos;
using MidiMemeGame.Api.Dto.Users;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly SourcePhotoQueries _sourcePhotoQueries;
    private readonly PhotoFileService _photoFiles;
    private readonly UserQueries _userQueries;
    private readonly ClerkUserService _clerkUserService;
    private readonly MemeQueries _memeQueries;

    public AdminController(
        SourcePhotoQueries sourcePhotoQueries,
        PhotoFileService photoFiles,
        UserQueries userQueries,
        ClerkUserService clerkUserService,
        MemeQueries memeQueries)
    {
        _sourcePhotoQueries = sourcePhotoQueries;
        _photoFiles = photoFiles;
        _userQueries = userQueries;
        _clerkUserService = clerkUserService;
        _memeQueries = memeQueries;
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
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(fileResult.Error));

        var savedFile = fileResult.Value;

        var photo = new SourcePhoto
        {
            FileId = savedFile.FileId,
            RelativeFilePath = savedFile.RelativePath,
            OriginalFileName = Path.GetFileName(
                file.FileName.Replace('\\', '/')),
            ContentType = savedFile.ContentType,
            SizeBytes = file.Length,
            IsEnabled = true
        };

        var photoResult = await _sourcePhotoQueries.AddAsync(
            photo,
            cancellationToken);

        if (photoResult.IsError)
        {
            _photoFiles.Delete(savedFile.RelativePath);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(photoResult.Error));
        }

        var createdPhoto = photoResult.Value;

        return StatusCode(StatusCodes.Status201Created, new AdminPhotoResponse
        {
            Id = createdPhoto.Id,
            IsEnabled = createdPhoto.IsEnabled
        });
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
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

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

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));
        }

        return Ok(new AdminPhotoResponse
        {
            Id = result.Value.Id,
            IsEnabled = result.Value.IsEnabled
        });
    }

    [HttpGet("users/lookup")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> LookupUser(
        [FromQuery] UserLookupRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _userQueries.FindActiveByEmailAsync(
            request.Email.Trim(),
            cancellationToken);

        if (result.Error == ErrorType.NOT_FOUND)
            return NotFound(ErrorResponse.Create(result.Error));

        if (result.Error == ErrorType.BAD_REQUEST)
            return Conflict(ErrorResponse.Create(result.Error));

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(result.Value);
    }

    [HttpPost("users/reset-rules-acknowledgements")]
    public async Task<IActionResult> ResetRulesAcknowledgements(
        CancellationToken cancellationToken)
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
    [HttpGet("memes")]
    public async Task<IActionResult> GetMemes(
        [FromQuery] MemeStatus? statusId,
        CancellationToken cancellationToken)
    {
        if (statusId.HasValue && !Enum.IsDefined(statusId.Value))
            return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

        var result = await _memeQueries.GetAdminMemesAsync(
            statusId, cancellationToken);

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(result.Value);
    }

    [HttpPatch("memes/{id:int:min(1)}/status")]
    public async Task<IActionResult> UpdateMemeStatus(
        int id,
        [FromQuery] MemeStatus statusId,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(statusId))
            return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

        var result = await _memeQueries.UpdateStatusAsync(
            id, statusId, cancellationToken);

        if (result.Error == ErrorType.NOT_FOUND)
            return NotFound(ErrorResponse.Create(result.Error));

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(new { id, statusId = (int)statusId });
    }
}