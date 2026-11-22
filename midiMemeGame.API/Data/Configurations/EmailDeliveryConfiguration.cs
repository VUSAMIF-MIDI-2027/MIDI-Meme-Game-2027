using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public class EmailDeliveryConfiguration : IEntityTypeConfiguration<EmailDelivery>
{
    public void Configure(EntityTypeBuilder<EmailDelivery> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.TemplateKey).HasMaxLength(100);
        builder.Property(e => e.RecipientAddress).HasMaxLength(320).IsRequired();
        builder.Property(e => e.Subject).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Body).IsRequired();
        builder.Property(e => e.IsHtml).IsRequired().HasDefaultValue(false);
        builder.Property(e => e.LastError).HasMaxLength(1000);
        builder.Property(e => e.DeduplicationKey).HasMaxLength(200);

        builder.HasIndex(e => e.DeduplicationKey)
               .IsUnique();

        builder.HasIndex(e => new { e.Status, e.NextAttemptAtUtc });
    }
}