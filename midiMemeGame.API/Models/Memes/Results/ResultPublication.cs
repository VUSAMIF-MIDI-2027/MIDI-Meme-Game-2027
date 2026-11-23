using System;

namespace MidiMemeGame.Api.Models.Memes.Results;

public class ResultPublication
{
    public int EventScheduleId { get; set; }
    public DateTime PublishedAtUtc { get; set; }

    public List<PublishedMemeResult> Results { get; set; } = new();
}
