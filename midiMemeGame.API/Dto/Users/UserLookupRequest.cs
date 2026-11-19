using System;
using System.ComponentModel.DataAnnotations;

namespace MidiMemeGame.Api.Dto.Users;

public class UserLookupRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public required string Email { get; set; }
}
