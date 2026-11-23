
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Enums;

namespace MidiMemeGame.Api.Services;

public class MemeModerationService
{
    private readonly AppDbContext _db;
    private readonly MemeQueries _memeQueries;
    private readonly MemeNotificationService _notifications;
    private readonly ILogger<MemeModerationService> _logger;
    public MemeModerationService(
        AppDbContext db,
        MemeQueries memeQueries,
        MemeNotificationService notifications,
        ILogger<MemeModerationService> logger)
    {
        _db = db;
        _memeQueries = memeQueries;
        _notifications = notifications;
        _logger = logger;
    }
    public async Task<Result> UpdateStatusAsync(
    int memeId,
    MemeStatus status,
    CancellationToken cancellationToken)
    {
        try
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

            var memeResult = await _memeQueries.GetModerationDetailsAsync(
                memeId, cancellationToken);

            if (memeResult.IsError)
                return memeResult.Error;

            if (!memeResult.TryGetResult(out var meme) || meme is null)
                return ErrorType.NOT_FOUND;

            var update = await _memeQueries.UpdateStatusAsync(
                memeId, status, cancellationToken);

            if (update.IsError)
                return update.Error;

            var statusChanged = meme.StatusId != (int)status;
            if (statusChanged && status is MemeStatus.Approved or MemeStatus.Rejected)
            {
                var templateKey = status == MemeStatus.Approved
                    ? EmailTemplateKeys.MemeApproved
                    : EmailTemplateKeys.MemeRejected;
                var notification = await _notifications.EnqueueAsync(
                    memeId, meme, templateKey, cancellationToken);

                if (notification.IsError)
                    return notification.Error;
            }

            await transaction.CommitAsync(cancellationToken);
            return Result.Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex, "Nepavyko pakeisti memo {MemeId} statuso į {Status}.",
                memeId, status);

            return ErrorType.DB_EXCEPTION;
        }
    }
}
