namespace MidiMemeGame.Api.Models.Settings;

public class PhotoUploadSettings
{
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
    public long MaxRequestSizeBytes { get; set; } = 11 * 1024 * 1024;
    public string[] AllowedContentTypes { get; set; } = ["image/jpeg", "image/png", "image/webp"];
}
