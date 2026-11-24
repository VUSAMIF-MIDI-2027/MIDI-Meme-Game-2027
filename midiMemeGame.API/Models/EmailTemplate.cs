namespace MidiMemeGame.Api.Models;

public class EmailTemplate
{
    public string Key { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; }
    public string AllowedPlaceholdersJson { get; set; } = "[]";
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}