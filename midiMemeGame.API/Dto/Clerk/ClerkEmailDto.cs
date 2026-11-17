using System;
using System.Text.Json.Serialization;

namespace MidiMemeGame.Api.Dto.Clerk;

public class ClerkEmailDto
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("email_address")]
    public string? EmailAddress { get; init; }
}
