using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public class SourcePhotoConfiguration : IEntityTypeConfiguration<SourcePhoto>
{
    public void Configure(EntityTypeBuilder<SourcePhoto> builder)
    {
        builder.ToTable("SourcePhotos");

        builder.HasKey(photo => photo.Id);

        builder.HasIndex(photo => photo.FileId)
            .IsUnique();

        builder.Property(photo => photo.FileId)
            .IsRequired()
            .HasMaxLength(12);

        builder.Property(photo => photo.RelativeFilePath)
            .IsRequired();

        builder.Property(photo => photo.OriginalFileName)
            .IsRequired();

        builder.Property(photo => photo.ContentType)
            .IsRequired();
    }
}
