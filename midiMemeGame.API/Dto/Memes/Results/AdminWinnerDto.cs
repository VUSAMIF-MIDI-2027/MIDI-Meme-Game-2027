using System.ComponentModel.DataAnnotations.Schema;

namespace MidiMemeGame.Api.Dto.Memes.Results;

public class AdminWinnerDto : PublishedResultDto
{
    public string? Email { get; init; }

    [NotMapped]
    public bool? NameShown { get; set; }
}
