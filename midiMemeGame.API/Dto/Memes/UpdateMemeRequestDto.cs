using System;
using System.ComponentModel.DataAnnotations;

namespace MidiMemeGame.Api.Dto.Memes;

public class UpdateMemeRequestDto
{
    [Required]
    public required string Caption { get; set; }
}
