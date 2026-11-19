using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public class EventScheduleConfiguration : IEntityTypeConfiguration<EventSchedule>
{
    public void Configure(EntityTypeBuilder<EventSchedule> builder)
    {
        builder.ToTable("EventSchedule", table =>
            table.HasCheckConstraint(
                "CK_EventSchedule_SingleRow",
                $"\"Id\" = {EventSchedule.SingletonId}"));

        builder.HasKey(schedule => schedule.Id);

        builder.Property(schedule => schedule.Id)
            .ValueGeneratedNever();

        builder.Property(schedule => schedule.EventStartsAt)
            .IsRequired();

        builder.Property(schedule => schedule.VotingStartsAt)
            .IsRequired();

        builder.Property(schedule => schedule.EventEndsAt)
            .IsRequired();
    }
}
