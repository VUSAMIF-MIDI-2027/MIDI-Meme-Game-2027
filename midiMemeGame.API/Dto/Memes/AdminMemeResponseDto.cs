namespace MidiMemeGame.Api.Dto.Memes;

public class AdminMemeResponseDto : MemeResponseDto
{
    public bool IsDeleted { get; init; }
    public string? AuthorEmail { get; init; }
}
