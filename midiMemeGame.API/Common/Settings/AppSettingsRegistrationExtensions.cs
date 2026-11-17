using System;
using MidiMemeGame.Api.Models.Settings;

namespace MidiMemeGame.Api.Common.Settings;

public static class AppSettingsRegistrationExtensions
{
    public static IServiceCollection AddAppSettings(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<ClerkSettings>()
            .Bind(configuration.GetSection("Clerk"))
            .Validate(
                settings =>
                    Uri.TryCreate(
                        settings.Authority,
                        UriKind.Absolute,
                        out var authority
                    )
                    && authority.Scheme == Uri.UriSchemeHttps,
                "Clerk:Authority must be a valid HTTPS URL"
            )
            .Validate(
                settings => !string.IsNullOrWhiteSpace(settings.SecretKey),
                "Clerk:SecretKey is missing"
            )
            .Validate(
                settings =>
                    settings.AuthorizedParties.Length > 0
                    && settings.AuthorizedParties.All(address =>
                        Uri.TryCreate(address, UriKind.Absolute, out var uri)
                        && (uri.Scheme == Uri.UriSchemeHttps
                            || uri.Scheme == Uri.UriSchemeHttp)),
                "Clerk:AuthorizedParties must contain valid frontend URLs"
            )
            .ValidateOnStart();

        return services;
    }
}
