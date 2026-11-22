using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public sealed class MemeConfiguration : IEntityTypeConfiguration<Meme>
{
    public void Configure(EntityTypeBuilder<Meme> builder)
    {
        builder.ToTable("Memes");
        builder.HasKey(meme => meme.Id);
        builder.Property(meme => meme.SourcePhotoId).IsRequired();
        builder.Property(meme => meme.UserId).IsRequired();
        builder.Property(meme => meme.Caption).IsRequired();
        builder.Property(meme => meme.Score).HasDefaultValue(0L);
        builder.HasIndex(meme => new { meme.SourcePhotoId, meme.StatusId, meme.IsDeleted });
    }
}
