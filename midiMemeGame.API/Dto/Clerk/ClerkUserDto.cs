using System;
using System.Text.Json.Serialization;

namespace MidiMemeGame.Api.Dto.Clerk;

public class ClerkUserDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("created_at")]
    public long? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public long? UpdatedAt { get; set; }

    [JsonPropertyName("primary_email_address_id")]
    public string? PrimaryEmailAddressId { get; set; }

    [JsonPropertyName("email_addresses")]
    public List<ClerkEmailDto>? EmailAddresses { get; set; }
}
