using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Data;
using MidiMemeGame.Api.Common.Extensions;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Middleware;
using Serilog;

namespace midiMemeGame.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                var builder = WebApplication.CreateBuilder(args);

                builder.Host.UseSerilog((context, configuration) =>
                {
                    configuration.ReadFrom.Configuration(context.Configuration);
                });

                builder.WebHost.UseUrls("http://localhost:5000");

                // Add services to the container.

                builder.Services.AddControllers();
                builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
                    policy.WithOrigins(
                            "http://localhost:3000",
                            "http://127.0.0.1:3000",
                            "https://midi.lt",
                            "https://www.naktis.midi.lt")
                        .AllowAnyHeader()
                        .AllowAnyMethod()));

                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();
                builder.Services.AddAppSettings(builder.Configuration);

                builder.Services.AddDatabase(builder.Configuration);

                var app = builder.Build();

                app.InitializeDatabase();
                app.UseMiddleware<TraceLoggingMiddleware>();
                app.UseSerilogRequestLogging();
                app.UseMiddleware<ExceptionMiddleware>();

                // Configure the HTTP request pipeline.
                if (app.Environment.IsDevelopment())
                {
                    app.UseSwagger();
                    app.UseSwaggerUI();
                }

                app.UseHttpsRedirection();

                app.UseCors("Frontend");
                app.UseAuthorization();

                app.MapControllers();

                app.Run();
            }
            catch (Exception ex)
            {
                using var startupLogger = new StreamWriter("failed-startup.log");
                startupLogger.WriteLine("Application failed to start");
                startupLogger.WriteLine("Exception message: " + ex.Message);
                startupLogger.WriteLine("Inner exception message:" + ex.InnerException?.Message);
            }
        }
    }
}


