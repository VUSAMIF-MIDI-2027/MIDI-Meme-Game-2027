using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Models.Memes.Results;

namespace MidiMemeGame.Api.Data.Configurations;

public class ResultPublicationConfiguration : IEntityTypeConfiguration<ResultPublication>
{
    public void Configure(EntityTypeBuilder<ResultPublication> builder)
    {
        builder.HasKey(x => x.EventScheduleId);
        builder.Property(x => x.EventScheduleId).ValueGeneratedNever();

        builder.HasOne<EventSchedule>()
            .WithOne()
            .HasForeignKey<ResultPublication>(x => x.EventScheduleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Results)
            .WithOne()
            .HasForeignKey(x => x.EventScheduleId);
    }
}