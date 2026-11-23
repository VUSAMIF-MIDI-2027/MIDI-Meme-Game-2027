using System;

namespace MidiMemeGame.Api.Dto.Memes.Results;

public class AdminResultsDto
{
    public bool Published { get; init; }
    public DateTime? PublishedAtUtc { get; init; }

    public List<ResultCandidateDto> Candidates { get; init; } = new();
    public List<AdminWinnerDto> Winners { get; init; } = new();
}
