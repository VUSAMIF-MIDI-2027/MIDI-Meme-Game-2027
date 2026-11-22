namespace MidiMemeGame.Api.Dto.Email;

public class EmailTemplateListItemResponse
{
    public string Key { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public DateTime UpdatedAtUtc { get; set; }
}