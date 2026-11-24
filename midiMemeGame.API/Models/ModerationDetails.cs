using System;

namespace MidiMemeGame.Api.Models;

public class ModerationDetails
{
    public DateTime UpdatedAtUtc { get; init; }
    public int StatusId { get; init; }
    public required string Caption { get; init; }
    public string? FirstName { get; init; }
    public string? Email { get; init; }
    public string? RelativeFilePath { get; init; }
}
