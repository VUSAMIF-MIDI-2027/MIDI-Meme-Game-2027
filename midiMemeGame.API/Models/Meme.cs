namespace MidiMemeGame.Api.Models;

public class Meme
{
    public int Id { get; set; }
    public required string SourcePhotoId { get; set; }
	public required string UserId { get; set; }
    public MemeStatus Status { get; set; } = MemeStatus.Pending;
    public required string Caption { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}

public enum MemeStatus
{
    Pending = 1,
    Rejected = 2,
    Approved = 3
}
