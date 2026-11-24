using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Common.Data;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }

    public static void InitializeDatabase(this WebApplication app)
    {
        Directory.CreateDirectory("App_Data");

        using var scope = app.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (!string.IsNullOrEmpty(app.Configuration["Deployment:Slot"]))
        {
            // A parallel candidate must never migrate the database underneath the live API.
            if (db.Database.GetPendingMigrations().Any())
                throw new InvalidOperationException("Apply compatible database migrations before deployment.");
            return;
        }

        db.Database.Migrate();
    }
}