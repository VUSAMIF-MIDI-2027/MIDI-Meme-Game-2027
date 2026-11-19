using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace MidiMemeGame.Api.Common.Extensions;

public static class DevelopmentAuthenticationExtensions
{
    public static IServiceCollection AddDevelopmentBearerIdentities(this IServiceCollection services)
    {
        services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.Events ??= new JwtBearerEvents();
            var previousHandler = options.Events.OnMessageReceived;
            options.Events.OnMessageReceived = async context =>
            {
                var role = context.Request.Headers.Authorization.ToString() switch
                {
                    "Bearer dev-user" => "user",
                    "Bearer dev-admin" => "admin",
                    _ => null
                };

                if (role is null)
                {
                    if (previousHandler is not null) await previousHandler(context);
                    return;
                }

                var claims = new List<Claim>
                {
                    new("sub", $"local-{role}"),
                    new("sid", "local-development-session"),
                    new("role", role)
                };
                context.Principal = new ClaimsPrincipal(new ClaimsIdentity(
                    claims,
                    JwtBearerDefaults.AuthenticationScheme,
                    nameType: "sub",
                    roleType: "role"));
                context.Success();
            };
        });

        return services;
    }
}
