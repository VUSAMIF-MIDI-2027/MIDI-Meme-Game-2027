namespace MidiMemeGame.Api.Models;

public class SourcePhoto
{
    public int Id { get; set; }
    public required string FileId { get; set; }
    public required string OriginalFileName { get; set; }
    public required string ContentType { get; set; }
    public long SizeBytes { get; set; }
    public bool IsEnabled { get; set; } = true;
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}
