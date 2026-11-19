namespace MidiMemeGame.Api.Models;

public class MemeTemplate
{
    public int Id { get; set; }
    public string RelativePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
    public bool IsEnabled { get; set; } = true;
}