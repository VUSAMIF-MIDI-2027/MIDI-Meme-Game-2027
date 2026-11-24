using System;

namespace MidiMemeGame.Api.Models;

public class EmailAttachment
{
    public required string FileName { get; init; }
    public required byte[] Content { get; init; }
}
