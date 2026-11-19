namespace MidiMemeGame.Api.Dto.Users;

public class CurrentUserResponse
{
    public int UserId { get; set; }
    public DateTime? RulesAcknowledgedAtUtc { get; set; }
}
