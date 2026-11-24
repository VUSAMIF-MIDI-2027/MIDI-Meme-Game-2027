namespace MidiMemeGame.Api.Dto.Memes.Results;

public sealed record PublishedResultsPageDto(
    IReadOnlyList<PublishedResultDto> Items,
    int? NextAfterPlace,
    string PublicationVersion);
