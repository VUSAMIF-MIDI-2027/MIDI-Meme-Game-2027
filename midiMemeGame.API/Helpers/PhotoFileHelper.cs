using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Helpers;

public static class PhotoFileHelper
{
    public static async Task<Result<PhotoFileType>> DetectTypeAsync(
            IFormFile file,
            CancellationToken cancellationToken)
    {
        var header = new byte[12];

        await using var stream = file.OpenReadStream();

        var bytesRead = await stream.ReadAtLeastAsync(
            header.AsMemory(),
            minimumBytes: header.Length,
            throwOnEndOfStream: false,
            cancellationToken: cancellationToken);

        if (bytesRead >= 3 && header.AsSpan(0, 3).SequenceEqual(new byte[] { 0xFF, 0xD8, 0xFF }))
        {
            return new PhotoFileType
            {
                ContentType = "image/jpeg",
                Extension = ".jpg"
            };
        }

        if (bytesRead >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }))
        {
            return new PhotoFileType
            {
                ContentType = "image/png",
                Extension = ".png"
            };
        }

        if (bytesRead >= 12 && header.AsSpan(0, 4).SequenceEqual("RIFF"u8) && header.AsSpan(8, 4).SequenceEqual("WEBP"u8))
        {
            return new PhotoFileType
            {
                ContentType = "image/webp",
                Extension = ".webp"
            };
        }

        return ErrorType.PHOTO_FILE_TYPE_INVALID;
    }
}
