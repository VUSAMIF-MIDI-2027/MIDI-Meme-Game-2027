namespace MidiMemeGame.Api.Dto.Email;

public class EmailDeliveryResponse
{
    public int Id { get; set; }
    public string? TemplateKey { get; set; }
    public string RecipientAddress { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public string? LastError { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? SentAtUtc { get; set; }
}