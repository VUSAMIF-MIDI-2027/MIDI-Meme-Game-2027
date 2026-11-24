using System;

namespace MidiMemeGame.Api.Dto.Memes.Voting;

public class VotableMemeDto
{
    public int Id { get; set; }
    public int SourcePhotoId { get; set; }
    public required string Caption { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public bool HasVoted { get; set; }
    public bool IsOwnMeme { get; set; }
}
