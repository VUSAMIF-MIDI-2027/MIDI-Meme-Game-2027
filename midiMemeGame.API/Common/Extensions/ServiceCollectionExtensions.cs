namespace MidiMemeGame.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAppSettings(this IServiceCollection services, IConfiguration configuration)
    {
        return services;
    }
}
