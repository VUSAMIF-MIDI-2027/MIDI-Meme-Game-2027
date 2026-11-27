using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using MidiMemeGame.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;

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
    public static void MigrateProductionDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var pending = db.Database.GetPendingMigrations().ToArray();
        if (pending.Length == 0)
        {
            Console.WriteLine("Production database is up to date.");
            return;
        }

        // The live API continues to use this database during deployment.
        var assembly = db.GetService<IMigrationsAssembly>();
        foreach (var id in pending)
        {
            var migration = assembly.CreateMigration(assembly.Migrations[id], db.Database.ProviderName!);
            if (migration.UpOperations.Any(operation => operation is not AddColumnOperation
                { ComputedColumnSql: null, DefaultValueSql: null, IsStored: null, IsRowVersion: false } column
                || (!column.IsNullable && column.DefaultValue is null)
                || column.FindAnnotation("Sqlite:Autoincrement") is not null))
            {
                throw new InvalidOperationException(
                    $"Migration {id} requires a separate rollout while the live API uses this database.");
            }
        }

        var source = (SqliteConnection)db.Database.GetDbConnection();
        var backupDir = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(source.DataSource))!, "backups");
        Directory.CreateDirectory(backupDir);
        var backupPath = Path.Combine(backupDir, $"before-migration-{DateTime.UtcNow:yyyyMMddTHHmmss}-{Guid.NewGuid():N}.sqlite");
        var backupConnection = new SqliteConnectionStringBuilder
        {
            DataSource = backupPath,
            Pooling = false,
        };

        using (var backup = new SqliteConnection(backupConnection.ToString()))
        {
            db.Database.OpenConnection();
            try
            {
                backup.Open();
                source.BackupDatabase(backup);
                using var check = backup.CreateCommand();
                check.CommandText = "PRAGMA integrity_check";
                if (check.ExecuteScalar() is not string result || result != "ok")
                    throw new InvalidOperationException("Production database backup failed integrity check.");
            }
            finally
            {
                db.Database.CloseConnection();
            }
        }

        Console.WriteLine($"Validated database backup: {backupPath}");
        Console.WriteLine($"Applying migrations: {string.Join(", ", pending)}");
        db.Database.Migrate();
    }
}