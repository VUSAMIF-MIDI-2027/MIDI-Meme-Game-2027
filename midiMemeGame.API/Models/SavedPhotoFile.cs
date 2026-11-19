using System;

namespace MidiMemeGame.Api.Models;

public class SavedPhotoFile
{
    public required string FileId { get; set; }
    public required string RelativePath { get; set; }
    public required string ContentType { get; set; }
    public required string Extension { get; set; }
}
