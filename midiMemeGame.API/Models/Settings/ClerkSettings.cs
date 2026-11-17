using System;

namespace MidiMemeGame.Api.Models.Settings;

public class ClerkSettings
{
    public string Authority { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string[] AuthorizedParties { get; set; } = [];
}
