using MidiMemeGame.Api.Enums;

namespace MidiMemeGame.Api.Models;

public class EmailDelivery
{
    public int Id { get; set; }
    public string? TemplateKey { get; set; }
    public string RecipientAddress { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; }
    public EmailDeliveryStatus Status { get; set; } = EmailDeliveryStatus.Pending;
    public int AttemptCount { get; set; }
    public DateTime NextAttemptAtUtc { get; set; } = DateTime.UtcNow;
    public string? LastError { get; set; }
    public string? DeduplicationKey { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ClaimedAtUtc { get; set; }
    public DateTime? SentAtUtc { get; set; }
}