namespace MidiMemeGame.Api.Dto.Memes.Voting;

public class MyVotingStateDto
{
    public int RemainingVotes { get; init; }
    public required List<int> VotedMemeIds { get; init; }
}
