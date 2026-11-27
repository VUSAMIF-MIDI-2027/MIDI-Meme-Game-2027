using System;

namespace MidiMemeGame.Api.Dto.Memes.Results;

public class ResultCandidateDto : MemeResultDto
{
    public bool PublicationAllowed { get; set; }
    public bool GalleryPublicationAccepted { get; set; }
    public bool? NamePublicationAllowed { get; set; }
    public string? Email { get; set; }
}
