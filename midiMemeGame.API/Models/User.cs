using System;

namespace MidiMemeGame.Api.Models;

public class User
{
    public int Id { get; set; }
    public required string ClerkId { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
