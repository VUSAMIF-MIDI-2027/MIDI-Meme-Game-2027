namespace MidiMemeGame.Api.Models.Settings;

public class SmtpSettings
{
    public string Host { get; set; } = "";
    public int Port { get; set; }
    public string Security { get; set; } = "";
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string FromAddress { get; set; } = "";
    public string FromName { get; set; } = "";
    public int MaxAttempts { get; set; }
    public int PollIntervalSeconds { get; set; }
}