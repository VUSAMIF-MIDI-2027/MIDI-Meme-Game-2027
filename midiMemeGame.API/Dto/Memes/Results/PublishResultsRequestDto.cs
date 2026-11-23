using System;

namespace MidiMemeGame.Api.Dto.Memes.Results;

public class PublishResultsRequestDto
{
    public required int[] PodiumMemeIds { get; init; }
}
