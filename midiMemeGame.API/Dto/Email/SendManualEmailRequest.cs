namespace MidiMemeGame.Api.Dto.Email;

public class SendManualEmailRequest
{
    public string? UserId { get; set; }
    public string? RecipientEmail { get; set; }
    public string? RecipientName { get; set; }
    public string? TemplateKey { get; set; }
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public Dictionary<string, string>? Variables { get; set; }
}