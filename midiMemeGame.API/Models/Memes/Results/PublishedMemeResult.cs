using System;

namespace MidiMemeGame.Api.Models.Memes.Results;

public class PublishedMemeResult
{
    public int EventScheduleId { get; set; }
    public int Place { get; set; }
    public int MemeId { get; set; }
    public int SourcePhotoId { get; set; }
    public required string Caption { get; set; }
    public string? UserName { get; set; }
    public int StatusId { get; set; }
    public long Score { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public string? WinnerEmail { get; set; }
    public int? WinnerDeliveryId { get; set; }
}
