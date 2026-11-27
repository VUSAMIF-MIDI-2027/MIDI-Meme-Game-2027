using MidiMemeGame.Api.Enums;

namespace MidiMemeGame.Api.Models.Memes;

public class Meme
{
    public int Id { get; set; }
    public required string SourcePhotoId { get; set; }
    public required string UserId { get; set; }
    public MemeStatus StatusId { get; set; } = MemeStatus.Pending;
    public required string Caption { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; }
    public long Score { get; set; }
    public DateTime? MemePublicationConsentedAtUtc { get; set; }
    public DateTime? NamePublicationConsentedAtUtc { get; set; }
    public DateTime? MemePublicationWithdrawnAtUtc { get; set; }
    public DateTime? NamePublicationWithdrawnAtUtc { get; set; }
    public bool GalleryPublicationAccepted { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsInvalidatedBySourcePhoto { get; set; }
}


