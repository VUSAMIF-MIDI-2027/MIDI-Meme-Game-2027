namespace MidiMemeGame.Api.Dto.Photos;

using MidiMemeGame.Api.Models;

public sealed record PhotoResponse(
    int Id,
    string OriginalFileName,
    string ContentType,
    long SizeBytes,
    bool IsEnabled,
    DateTime UploadedAtUtc,
    string FileUrl)
{
    public static PhotoResponse From(SourcePhoto photo) => new(
        photo.Id,
        photo.OriginalFileName,
        photo.ContentType,
        photo.SizeBytes,
        photo.IsEnabled,
        photo.UploadedAtUtc,
        $"/api/photos/{photo.Id}/file");
}

public sealed class UpdatePhotoRequest
{
    public bool? IsEnabled { get; set; }
}
