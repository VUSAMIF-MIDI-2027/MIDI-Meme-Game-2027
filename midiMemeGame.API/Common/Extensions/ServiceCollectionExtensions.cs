using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services;
using MidiMemeGame.Api.Services.Interfaces;
using MidiMemeGame.Api.Workers;

namespace MidiMemeGame.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        services.AddHttpClient<ClerkUserService>((provider, client) =>
        {
            var settings = provider
                .GetRequiredService<IOptions<ClerkSettings>>()
                .Value;

            client.BaseAddress = new Uri("https://api.clerk.com/v1/");
            client.Timeout = TimeSpan.FromSeconds(15);

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    settings.SecretKey
                );
        });

        services.AddScoped<UserQueries>();
        services.AddScoped<SourcePhotoQueries>();
        services.AddScoped<MemeQueries>();
        services.AddScoped<EventScheduleQueries>();
        services.AddScoped<PhotoFileService>();
        services.AddScoped<EmailTemplateQueries>();
        services.AddScoped<EmailDeliveryQueries>();
        services.AddScoped<EmailAttachmentQueries>();
        services.AddScoped<EmailMilestoneProgressQueries>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IScheduledEmailService, ScheduledEmailService>();
        services.AddHostedService<EmailDeliveryWorker>();
        services.AddHostedService<ScheduledEmailWorker>();
        services.AddScoped<EventPhaseService>();
        services.AddScoped<MemeService>();
        services.AddScoped<MemeModerationService>();
        services.AddScoped<MemeNotificationService>();
        services.AddScoped<VoteQueries>();

        return services;
    }
    public static IServiceCollection AddAppCors(
    this IServiceCollection services
)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "https://midi.lt",
                        "https://naktis.midi.lt",
                        "https://www.naktis.midi.lt"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
    public static IServiceCollection AddAppAuthentication(
    this IServiceCollection services
)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();

        services
            .AddOptions<JwtBearerOptions>(
                JwtBearerDefaults.AuthenticationScheme
            )
            .Configure<IOptions<ClerkSettings>>((options, clerkOptions) =>
            {
                var settings = clerkOptions.Value;

                options.Authority = settings.Authority;
                options.MapInboundClaims = false;
                options.IncludeErrorDetails = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = settings.Authority,

                    ValidateIssuerSigningKey = true,
                    RequireSignedTokens = true,
                    ValidAlgorithms = [SecurityAlgorithms.RsaSha256],

                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    ClockSkew = TimeSpan.FromSeconds(5),

                    ValidateAudience = false,
                    NameClaimType = "sub",
                    RoleClaimType = "role"
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var userId = context.Principal?.FindFirst("sub")?.Value;
                        var sessionId = context.Principal?.FindFirst("sid")?.Value;
                        var authorizedParty = context.Principal?.FindFirst("azp")?.Value;

                        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(sessionId))
                        {
                            context.Fail("Clerk session identity is missing.");

                            return Task.CompletedTask;
                        }

                        if (authorizedParty == null || !settings.AuthorizedParties.Contains(
                                authorizedParty,
                                StringComparer.Ordinal
                            ))
                        {
                            context.Fail("Clerk authorized party is invalid.");
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorization();

        return services;
    }
}
