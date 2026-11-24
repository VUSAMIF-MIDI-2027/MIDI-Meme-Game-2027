using System;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Models.Memes;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Configurations;

public class MemeVoteConfiguration : IEntityTypeConfiguration<MemeVote>
{
    public void Configure(EntityTypeBuilder<MemeVote> builder)
    {
        builder.ToTable("MemeVotes");

        builder.HasKey(vote => new { vote.UserId, vote.MemeId });
        builder.HasIndex(vote => vote.MemeId);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(vote => vote.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Meme>()
            .WithMany()
            .HasForeignKey(vote => vote.MemeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}