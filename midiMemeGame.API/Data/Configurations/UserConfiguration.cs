using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(user => user.Id);

        builder.HasIndex(user => user.ClerkId)
            .IsUnique();

        builder.Property(user => user.ClerkId).IsRequired();
        builder.Property(user => user.Email).IsRequired();
        builder.Property(user => user.FirstName).IsRequired();
        builder.Property(user => user.LastName).IsRequired();
    }
}
