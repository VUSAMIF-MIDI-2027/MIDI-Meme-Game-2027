using MidiMemeGame.Api.Enums;

namespace MidiMemeGame.Api.Models;

public class Meme
{
    public int Id { get; set; }
    public required string SourcePhotoId { get; set; }
    public required string UserId { get; set; }
    public MemeStatus StatusId { get; set; } = MemeStatus.Pending;
    public required string Caption { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; }
    public long Score { get; set; }
    public bool IsDeleted { get; set; }
}


