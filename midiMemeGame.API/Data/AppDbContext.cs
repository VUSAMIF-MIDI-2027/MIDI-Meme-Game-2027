using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<SourcePhoto> SourcePhotos { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<DeletedClerkUser> DeletedClerkUsers { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
