using System.Globalization;
using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;

namespace MidiMemeGame.Api.Common.Extensions;

public static class ApiRateLimitingExtensions
{
    public static IServiceCollection AddApiRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var requestsPerMinute = configuration.GetValue("RateLimiting:RequestsPerMinute", 1200);
        if (requestsPerMinute <= 0)
        {
            throw new InvalidOperationException("RateLimiting:RequestsPerMinute must be positive.");
        }

        var window = TimeSpan.FromMinutes(1);

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor;
            options.ForwardLimit = 1;

            foreach (var proxy in configuration.GetSection("ForwardedHeaders:KnownProxies").GetChildren())
            {
                if (!IPAddress.TryParse(proxy.Value, out var address))
                {
                    throw new InvalidOperationException("ForwardedHeaders:KnownProxies must contain IP addresses.");
                }

                options.KnownProxies.Add(address);
            }
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                if (!context.Request.Path.StartsWithSegments("/api"))
                {
                    return RateLimitPartition.GetNoLimiter("non-api");
                }

                var address = context.Connection.RemoteIpAddress;
                if (address?.IsIPv4MappedToIPv6 == true)
                {
                    address = address.MapToIPv4();
                }

                return RateLimitPartition.GetSlidingWindowLimiter(
                    address?.ToString() ?? "unknown",
                    _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = requestsPerMinute,
                        Window = window,
                        SegmentsPerWindow = 6,
                        QueueLimit = 0
                    });
            });

            options.OnRejected = async (context, cancellationToken) =>
            {
                var response = context.HttpContext.Response;
                response.Headers.CacheControl = "no-store";

                var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var estimate)
                    ? estimate
                    : window;
                response.Headers.RetryAfter = Math.Max(1, Math.Ceiling(retryAfter.TotalSeconds))
                    .ToString(CultureInfo.InvariantCulture);

                await Results.Problem(
                    statusCode: StatusCodes.Status429TooManyRequests,
                    title: "Too many requests").ExecuteAsync(context.HttpContext);
            };
        });

        return services;
    }
}
