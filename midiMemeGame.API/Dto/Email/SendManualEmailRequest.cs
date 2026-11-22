namespace MidiMemeGame.Api.Dto.Email;

public class SendManualEmailRequest
{
    public int? RecipientUserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}