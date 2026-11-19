namespace MidiMemeGame.Api.Dto.Users;

public class AdminUserLookupResponse
{
    public int UserId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
}
