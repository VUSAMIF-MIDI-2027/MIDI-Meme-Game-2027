using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public class EmailMilestoneProgressConfiguration : IEntityTypeConfiguration<EmailMilestoneProgress>
{
    public void Configure(EntityTypeBuilder<EmailMilestoneProgress> builder)
    {
        builder.HasKey(e => new { e.EventId, e.Milestone });
        builder.Property(e => e.EventId).HasMaxLength(64).IsRequired();
        builder.Property(e => e.Milestone).HasMaxLength(100).IsRequired();
    }
}