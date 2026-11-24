using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.HasKey(e => e.Key);
        builder.Property(e => e.Key).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Subject).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Body).IsRequired();
        builder.Property(e => e.IsHtml).IsRequired().HasDefaultValue(false);
        builder.Property(e => e.AllowedPlaceholdersJson).IsRequired();
    }
}