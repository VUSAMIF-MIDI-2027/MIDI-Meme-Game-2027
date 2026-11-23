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
        if (string.IsNullOrWhiteSpace(meme.Email))
            return ErrorType.EMAIL_RECIPIENT_MISSING;

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

        if (string.IsNullOrWhiteSpace(meme.RelativeFilePath))
            return ErrorType.NOT_FOUND;

        var path = _photoFiles.ResolvePath(meme.RelativeFilePath);
        if (path.IsError)
            return path.Error;

        var jpeg = MemePreviewRenderer.Render(path.Value, meme.Caption);
        var fileName = $"memas-{memeId}.jpg";

        return await _attachmentQueries.InsertAsync(
            delivery.Value.Id,
            fileName,
            jpeg,
            cancellationToken);
    }
}
