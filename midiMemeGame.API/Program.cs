using MidiMemeGame.Api.Common.Data;
using MidiMemeGame.Api.Common.Extensions;
using MidiMemeGame.Api.Common.Settings;
using MidiMemeGame.Api.Middleware;
using Serilog;
using Microsoft.AspNetCore.Http.Features;

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

                // builder.WebHost.UseUrls("http://localhost:5000");

                // Add services to the container.

                builder.Services.AddControllers();
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen(options =>
                {
                    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = Microsoft.OpenApi.ParameterLocation.Header,
                        Description = "Development: use dev-user or dev-admin. Otherwise provide a Clerk JWT."
                    });
                    options.AddSecurityRequirement(document => new Microsoft.OpenApi.OpenApiSecurityRequirement
                    {
                        [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
                    });
                });

                builder.Services.AddAppSettings(builder.Configuration);
                builder.Services.Configure<FormOptions>(options =>
                {
                    var maxRequestSize = builder.Configuration.GetValue<long>("PhotoUpload:MaxRequestSizeBytes", 11534336);
                    options.MultipartBodyLengthLimit = maxRequestSize;
                });
                builder.Services.AddAppServices();
                builder.Services.AddAppAuthentication();
                if (builder.Environment.IsDevelopment())
                {
                    builder.Services.AddDevelopmentBearerIdentities();
                }
                builder.Services.AddAppCors();
                builder.Services.AddDatabase(builder.Configuration);

                var app = builder.Build();

                app.InitializeDatabase();
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
                app.UseAuthentication();
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
                throw;
            }
        }
    }
}


