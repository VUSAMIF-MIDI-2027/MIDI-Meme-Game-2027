namespace MidiMemeGame.Api.Dto.Memes;

public class OwnMemeResponseDto : MemeResponseDto
{
    public bool PublishMeme { get; init; }
    public bool GalleryPublicationAccepted { get; init; }
    public bool PublishName { get; init; }
}
