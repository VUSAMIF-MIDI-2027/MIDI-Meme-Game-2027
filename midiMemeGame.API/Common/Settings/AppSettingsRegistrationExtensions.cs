using System;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Options;
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

        services.AddOptions<FileStorageSettings>()
            .Bind(configuration.GetSection("FileStorage"))
            .Validate(settings => !string.IsNullOrWhiteSpace(settings.RootPath), "FileStorage:RootPath is required")
            .ValidateOnStart();

        services.AddOptions<PhotoUploadSettings>()
            .Bind(configuration.GetSection("PhotoUpload"))
            .Validate(settings => settings.MaxFileSizeBytes > 0 && settings.MaxRequestSizeBytes >= settings.MaxFileSizeBytes,
                "PhotoUpload size limits are invalid")
            .ValidateOnStart();

        services.AddOptions<KestrelServerOptions>()
            .Configure<IOptions<PhotoUploadSettings>>((options, upload) =>
            {
                options.Limits.MaxRequestBodySize =
                    upload.Value.MaxRequestSizeBytes;
            });

        services.AddOptions<FormOptions>()
            .Configure<IOptions<PhotoUploadSettings>>((options, upload) =>
            {
                options.MultipartBodyLengthLimit =
                    upload.Value.MaxRequestSizeBytes;
            });

        return services;
    }
}
