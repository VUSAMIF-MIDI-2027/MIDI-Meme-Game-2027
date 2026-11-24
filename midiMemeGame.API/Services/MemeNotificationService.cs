using System.Globalization;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Services;

public class MemeNotificationService
{
    private readonly IEmailService _emailService;
    private readonly PhotoFileService _photoFiles;
    private readonly EmailAttachmentQueries _attachmentQueries;

    public MemeNotificationService(
        IEmailService emailService,
        PhotoFileService photoFiles,
        EmailAttachmentQueries attachmentQueries)
    {
        _emailService = emailService;
        _photoFiles = photoFiles;
        _attachmentQueries = attachmentQueries;
    }

    public async Task<Result> EnqueueAsync(
        int memeId,
        ModerationDetails meme,
        string templateKey,
        CancellationToken cancellationToken)
    {
        var delivery = await EnqueueWithPreviewAsync(
            memeId, meme, templateKey, null, null, cancellationToken);

        return delivery.IsError ? Result.Fail(delivery.Error) : Result.Ok();
    }

    public Task<Result<EmailDelivery>> EnqueueWinnerAsync(
        Guid publicationId,
        int memeId,
        ModerationDetails meme,
        int place,
        CancellationToken cancellationToken)
    {
        return EnqueueWithPreviewAsync(
            memeId,
            meme,
            EmailTemplateKeys.WinnerNotification,
            place,
            $"results:{publicationId:N}:winner:{place}:meme:{memeId}",
            cancellationToken);
    }

    private async Task<Result<EmailDelivery>> EnqueueWithPreviewAsync(
        int memeId,
        ModerationDetails meme,
        string templateKey,
        int? place,
        string? deduplicationKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(meme.Email))
            return ErrorType.EMAIL_RECIPIENT_MISSING;

        var variables = new Dictionary<string, string>
        {
            ["recipientName"] = EmailTemplateHelper.BuildRecipientName(meme.FirstName),
            ["memeTitle"] = meme.Caption
        };
        if (place.HasValue)
            variables["place"] = place.Value.ToString(CultureInfo.InvariantCulture);

        var delivery = await _emailService.EnqueueTemplatedAsync(
            templateKey, meme.Email, variables,
            deduplicationKey,
            cancellationToken: cancellationToken);

        if (delivery.IsError)
            return delivery.Error;

        if (string.IsNullOrWhiteSpace(meme.RelativeFilePath))
            return ErrorType.NOT_FOUND;

        var path = _photoFiles.ResolvePath(meme.RelativeFilePath);
        if (path.IsError)
            return path.Error;

        var jpeg = MemePreviewRenderer.Render(path.Value, meme.Caption);
        var fileName = $"memas-{memeId}.jpg";

        var attachment = await _attachmentQueries.InsertAsync(
            delivery.Value.Id,
            fileName,
            jpeg,
            cancellationToken);

        if (attachment.IsError)
           return attachment.Error;

        return delivery;
    }
}
