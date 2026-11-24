namespace MidiMemeGame.Api.Dto.Email;

public class EmailTemplateDetailResponse
{
    public string Key { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public IReadOnlyList<string> SupportedPlaceholders { get; set; } = [];
    public DateTime UpdatedAtUtc { get; set; }
}