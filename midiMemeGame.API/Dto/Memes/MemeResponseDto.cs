namespace MidiMemeGame.Api.Dto.Memes;

public class MemeResponseDto
{
    public int Id { get; init; }
    public int SourcePhotoId { get; init; }
    public required string Caption { get; init; }
    public int StatusId { get; init; }
    public long Score { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public DateTime UpdatedAtUtc { get; init; }
    public bool IsInvalidatedBySourcePhoto { get; init; }
}
