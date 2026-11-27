using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Data;
using MidiMemeGame.Api.Common.Extensions;
using MidiMemeGame.Api.Common.Settings;
using MidiMemeGame.Api.Middleware;
using Serilog;

namespace midiMemeGame.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            if (args is ["--migrate-production-db"])
            {
                var migrationBuilder = WebApplication.CreateBuilder();
                migrationBuilder.Services.AddDatabase(migrationBuilder.Configuration);
                using var migrationApp = migrationBuilder.Build();
                migrationApp.MigrateProductionDatabase();
                return;
            }
            try
            {
                var builder = WebApplication.CreateBuilder(args);

                builder.Host.UseSerilog((context, configuration) =>
                {
                    configuration.ReadFrom.Configuration(context.Configuration);
                });

                // builder.WebHost.UseUrls("http://localhost:5000");

                // Add services to the container.

                builder.Services.AddControllers();
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();

                builder.Services.AddAppSettings(builder.Configuration);
                builder.Services.AddAppServices();
                builder.Services.AddAppAuthentication();
                builder.Services.AddAppCors();
                builder.Services.AddApiRateLimiting(builder.Configuration);
                builder.Services.AddDatabase(builder.Configuration);

                var app = builder.Build();

                app.InitializeDatabase();
                app.UseForwardedHeaders();
                app.UseMiddleware<TraceLoggingMiddleware>();
                app.UseSerilogRequestLogging();
                app.UseMiddleware<ExceptionMiddleware>();

                // Configure the HTTP request pipeline.
                // if (app.Environment.IsDevelopment())
                // {
                app.UseSwagger();
                app.UseSwaggerUI();
                // }

                app.UseHttpsRedirection();

                app.UseCors("Frontend");
                app.UseRateLimiter();
                app.UseAuthentication();
                app.UseAuthorization();

                app.MapControllers();

                app.Run();
            }
            catch (Exception ex)
            {
                using var startupLogger = new StreamWriter("failed-startup.log");
                startupLogger.WriteLine(LogMessages.APPLICATION_START_FAILED);
                startupLogger.WriteLine(LogMessages.STARTUP_EXCEPTION_PREFIX + ex.Message);
                startupLogger.WriteLine(LogMessages.STARTUP_INNER_EXCEPTION_PREFIX + ex.InnerException?.Message);
                throw;
            }
        }
    }
}



