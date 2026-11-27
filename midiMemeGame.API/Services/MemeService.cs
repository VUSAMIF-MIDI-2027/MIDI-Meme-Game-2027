using System;
using System.Globalization;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Memes;
using MidiMemeGame.Api.Models.Memes;
using MidiMemeGame.Api.Models.Settings;

namespace MidiMemeGame.Api.Services;

public class MemeService
{
    private readonly AppDbContext _db;
    private readonly MemeNotificationService _notifications;
    private readonly MemeQueries _memeQueries;
    private readonly UserQueries _userQueries;
    private readonly SourcePhotoQueries _sourcePhotoQueries;
    private readonly EventPhaseService _eventPhase;
    private readonly MemeSettings _settings;
    private readonly ILogger<MemeService> _logger;
    public MemeService(
        AppDbContext db,
        MemeNotificationService notifications,
        MemeQueries memeQueries,
        UserQueries userQueries,
        SourcePhotoQueries sourcePhotoQueries,
        EventPhaseService eventPhase,
        IOptions<MemeSettings> settings,
        ILogger<MemeService> logger
    )
    {
        _db = db;
        _notifications = notifications;
        _memeQueries = memeQueries;
        _userQueries = userQueries;
        _sourcePhotoQueries = sourcePhotoQueries;
        _eventPhase = eventPhase;
        _settings = settings.Value;
        _logger = logger;
    }
    public async Task<Result<Meme>> UpdateAsync(
        int memeId,
        string clerkId,
        string caption,
        CancellationToken cancellationToken)
    {
        var user = await _userQueries.GetActiveIdByClerkIdAsync(
            clerkId, cancellationToken);

        if (user.Error == ErrorType.NOT_FOUND)
        {
            _logger.LogWarning(LogMessages.Memes.USER_ACCESS_DENIED, clerkId);
            return ErrorType.USER_ACCESS_DENIED;
        }

        if (user.IsError)
            return user.Error;

        var submissions = await _eventPhase.EnsureSubmissionsOpenAsync(
            cancellationToken);

        if (submissions.IsError)
            return submissions.Error;

        caption = caption.Trim();
        if (caption.Length > _settings.MaxCaptionLength)
            return ErrorType.BAD_REQUEST;

        var userId = user.Value.ToString(CultureInfo.InvariantCulture);

        var result = await _memeQueries.UpdateAsync(memeId, userId, caption, cancellationToken);

        if (result.Error == ErrorType.NOT_FOUND)
            _logger.LogWarning(LogMessages.Memes.UPDATE_TARGET_NOT_FOUND, user.Value, memeId);

        return result;
    }
    public async Task<Result<Meme>> CreateAsync(
        string clerkId,
        MemeRequestDto request,
        CancellationToken cancellationToken)
    {
        var user = await _userQueries.GetActiveIdByClerkIdAsync(clerkId, cancellationToken);

        if (user.Error == ErrorType.NOT_FOUND)
        {
            _logger.LogWarning(LogMessages.Memes.USER_ACCESS_DENIED, clerkId);
            return ErrorType.USER_ACCESS_DENIED;
        }

        if (user.IsError)
            return user.Error;

        var submissions = await _eventPhase.EnsureSubmissionsOpenAsync(cancellationToken);
        if (submissions.IsError)
            return submissions.Error;

        if (!request.AcceptGalleryPublication)
            return ErrorType.BAD_REQUEST;

        var caption = request.Caption.Trim();
        if (caption.Length > _settings.MaxCaptionLength)
            return ErrorType.BAD_REQUEST;

        var photo = await _sourcePhotoQueries.GetByIdAsync(request.SourcePhotoId, cancellationToken);

        if (photo.Error == ErrorType.NOT_FOUND)
        {
            _logger.LogWarning(LogMessages.Memes.SOURCE_PHOTO_NOT_FOUND, user.Value, request.SourcePhotoId);
            return photo.Error;
        }

        if (photo.IsError)
            return photo.Error;

        if (!photo.Value.IsEnabled)
        {
            _logger.LogWarning(
                LogMessages.Memes.SOURCE_PHOTO_DISABLED,
                user.Value,
                photo.Value.Id);

            return ErrorType.MEME_SOURCE_PHOTO_DISABLED;
        }

        var userId = user.Value.ToString(CultureInfo.InvariantCulture);
        var sourcePhotoId = photo.Value.Id.ToString(CultureInfo.InvariantCulture);

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        var result = await _memeQueries.CreateAsync(
            sourcePhotoId, userId, caption, request.PublishName, cancellationToken);

        if (result.Error == ErrorType.MEME_LIMIT_REACHED)
            _logger.LogWarning(LogMessages.Memes.SUBMISSION_LIMIT_REACHED, user.Value);

        if (result.IsError)
            return result;

        var details = await _memeQueries.GetModerationDetailsAsync(
            result.Value.Id, cancellationToken);
        if (details.IsError)
            return details.Error;

        var notification = await _notifications.EnqueueAsync(
            result.Value.Id, details.Value, EmailTemplateKeys.MemeSubmitted, cancellationToken);
        if (notification.IsError)
            return notification.Error;

        await transaction.CommitAsync(cancellationToken);
        return result;
    }
    public async Task<Result> DeleteAsync(int memeId, string clerkId, CancellationToken cancellationToken)
    {
        var user = await _userQueries.GetActiveIdByClerkIdAsync(clerkId, cancellationToken);

        if (user.Error == ErrorType.NOT_FOUND)
        {
            _logger.LogWarning(LogMessages.Memes.USER_ACCESS_DENIED, clerkId);
            return ErrorType.USER_ACCESS_DENIED;
        }

        if (user.IsError)
            return user.Error;

        var submissions = await _eventPhase.EnsureSubmissionsOpenAsync(cancellationToken);

        if (submissions.IsError)
            return submissions.Error;

        var userId = user.Value.ToString(CultureInfo.InvariantCulture);
        var result = await _memeQueries.DeleteAsync(memeId, userId, cancellationToken);

        if (result.Error == ErrorType.NOT_FOUND)
            _logger.LogWarning(LogMessages.Memes.DELETE_TARGET_NOT_FOUND, memeId, user.Value);

        return result;
    }

    public Task<Result> WithdrawPublicationAsync(
        int memeId, string clerkId, bool nameOnly, CancellationToken cancellationToken) =>
        UpdatePublicationAsync(memeId, clerkId, withdrawMeme: !nameOnly, publishName: false, cancellationToken);

    public Task<Result> SetNamePublicationAsync(
        int memeId, string clerkId, bool publishName, CancellationToken cancellationToken) =>
        UpdatePublicationAsync(memeId, clerkId, withdrawMeme: false, publishName, cancellationToken);

    private async Task<Result> UpdatePublicationAsync(
        int memeId, string clerkId, bool withdrawMeme, bool publishName, CancellationToken cancellationToken)
    {
        var user = await _userQueries.GetActiveIdByClerkIdAsync(clerkId, cancellationToken);
        if (user.Error == ErrorType.NOT_FOUND)
            return ErrorType.USER_ACCESS_DENIED;
        if (user.IsError)
            return user.Error;

        return await _memeQueries.UpdatePublicationAsync(
            memeId, user.Value.ToString(CultureInfo.InvariantCulture), withdrawMeme, publishName, cancellationToken);
    }

    public async Task<Result<List<OwnMemeResponseDto>>> GetMineMemesAsync(string clerkId, CancellationToken cancellationToken)
    {
        var user = await _userQueries.GetActiveIdByClerkIdAsync(
            clerkId, cancellationToken);

        if (user.Error == ErrorType.NOT_FOUND)
        {
            _logger.LogWarning(LogMessages.Memes.USER_ACCESS_DENIED, clerkId);
            return ErrorType.USER_ACCESS_DENIED;
        }

        if (user.IsError)
            return user.Error;

        var userId = user.Value.ToString(CultureInfo.InvariantCulture);

        return await _memeQueries.GetByUserIdAsync(userId, cancellationToken);
    }
}
