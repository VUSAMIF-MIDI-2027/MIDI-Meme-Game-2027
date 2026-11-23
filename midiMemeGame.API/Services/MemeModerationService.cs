
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Services;

public class MemeModerationService
{
    private readonly AppDbContext _db;
    private readonly MemeQueries _memeQueries;
    private readonly IEmailService _emailService;
    private readonly PhotoFileService _photoFiles;
    private readonly ILogger<MemeModerationService> _logger;
    private readonly EmailAttachmentQueries _attachmentQueries;
    public MemeModerationService(
        AppDbContext db,
        MemeQueries memeQueries,
        IEmailService emailService,
        PhotoFileService photoFiles,
        ILogger<MemeModerationService> logger,
        EmailAttachmentQueries attachmentQueries)
    {
        _db = db;
        _memeQueries = memeQueries;
        _emailService = emailService;
        _photoFiles = photoFiles;
        _logger = logger;
        _attachmentQueries = attachmentQueries;
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
                var notification = await EnqueueNotificationAsync(memeId, meme, status, cancellationToken);

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

    private async Task<Result> EnqueueNotificationAsync(
        int memeId,
        ModerationDetails meme,
        MemeStatus status,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(meme.Email))
            return ErrorType.EMAIL_RECIPIENT_MISSING;

        var templateKey = status == MemeStatus.Approved
            ? EmailTemplateKeys.MemeApproved
            : EmailTemplateKeys.MemeRejected;

        var variables = new Dictionary<string, string>
        {
            ["recipientName"] = EmailTemplateHelper.BuildRecipientName(meme.FirstName),
            ["memeTitle"] = meme.Caption
        };

        var delivery = await _emailService.EnqueueTemplatedAsync(
            templateKey, meme.Email, variables,
            deduplicationKey: null,
            cancellationToken: cancellationToken);

        if (delivery.IsError)
            return delivery.Error;

        if (status == MemeStatus.Rejected)
            return Result.Ok();

        if (string.IsNullOrWhiteSpace(meme.RelativeFilePath))
            return ErrorType.NOT_FOUND;

        var path = _photoFiles.ResolvePath(meme.RelativeFilePath);
        if (path.IsError)
            return path.Error;

        var jpeg = MemePreviewRenderer.Render(path.Value, meme.Caption);
        var fileName = $"memas-{memeId}.jpg";

        return await _attachmentQueries.InsertAsync(
            delivery.Value.Id,
            $"memas-{memeId}.jpg",
            jpeg,
            cancellationToken);
    }
}
