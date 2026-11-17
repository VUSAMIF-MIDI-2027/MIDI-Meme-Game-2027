using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public sealed class DeletedClerkUserConfiguration : IEntityTypeConfiguration<DeletedClerkUser>
{
    public void Configure(EntityTypeBuilder<DeletedClerkUser> builder)
    {
        builder.ToTable("DeletedClerkUsers");

        builder.HasKey(user => user.ClerkId);
    }

}
