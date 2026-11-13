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

        db.Database.EnsureCreated();
    }
}