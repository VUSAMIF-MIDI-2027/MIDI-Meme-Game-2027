using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models.Memes.Results;
namespace MidiMemeGame.Api.Data.Configurations;

public class PublishedMemeResultConfiguration
    : IEntityTypeConfiguration<PublishedMemeResult>
{
    public void Configure(EntityTypeBuilder<PublishedMemeResult> builder)
    {
        builder.HasKey(x => new { x.EventScheduleId, x.Place });

        builder.HasIndex(x => new { x.EventScheduleId, x.MemeId })
            .IsUnique();
    }
}
