namespace MidiMemeGame.Api.Models.Memes;

public class MemeVote
{
    public int UserId { get; set; }
    public int MemeId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
