using System;
using System.ComponentModel.DataAnnotations;

namespace MidiMemeGame.Api.Dto.Memes;

public class MemeRequestDto
{
    public required int SourcePhotoId { get; set; }
    [Required]
    public required string Caption { get; set; }
    public bool AcceptGalleryPublication { get; set; }
    public bool PublishName { get; set; }
}
