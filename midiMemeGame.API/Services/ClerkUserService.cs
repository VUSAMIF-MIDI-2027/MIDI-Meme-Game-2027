using System;
using System.Net;
using System.Text.Json;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Clerk;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Services;

public class ClerkUserService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private readonly ILogger<ClerkUserService> _logger;

    public ClerkUserService(
        HttpClient httpClient,
        AppDbContext db,
        ILogger<ClerkUserService> logger
    )
    {
        _httpClient = httpClient;
        _db = db;
        _logger = logger;
    }

    public async Task<Result<int>> SyncAsync(
        string clerkId,
        CancellationToken cancellationToken
    )
    {
        try
        {
            using var response = await _httpClient.GetAsync(
                $"users/{Uri.EscapeDataString(clerkId)}",
                cancellationToken
            );

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Clerk user {ClerkId} was not found.",clerkId);
                return ErrorType.NOT_FOUND;
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Clerk user request failed with status {StatusCode}.",(int)response.StatusCode);

                return ErrorType.CLERK_API_UNAVAILABLE;
            }

            var clerkUser = await response.Content
                .ReadFromJsonAsync<ClerkUserDto>(
                    cancellationToken: cancellationToken
                );

            var email = clerkUser?.EmailAddresses?
                .FirstOrDefault(address =>
                    address.Id == clerkUser.PrimaryEmailAddressId
                )
                ?.EmailAddress;

            if (clerkUser == null
                || clerkUser.Id != clerkId
                || string.IsNullOrWhiteSpace(clerkUser.FirstName)
                || string.IsNullOrWhiteSpace(clerkUser.LastName)
                || string.IsNullOrWhiteSpace(email)
                || clerkUser.CreatedAt == null
                || clerkUser.UpdatedAt == null)
            {
                _logger.LogWarning("Clerk returned incomplete user data for {ClerkId}.",clerkId);

                return ErrorType.CLERK_USER_DATA_INVALID;
            }

            var user = new User
            {
                ClerkId = clerkId,
                Email = email,
                FirstName = clerkUser.FirstName,
                LastName = clerkUser.LastName,
                CreatedAtUtc = DateTimeOffset
                    .FromUnixTimeMilliseconds(clerkUser.CreatedAt.Value)
                    .UtcDateTime,
                LastClerkUpdatedAt = clerkUser.UpdatedAt.Value
            };

            await UserQueries.UpsertFromClerkAsync(
                _db,
                user,
                cancellationToken
            );

            var userId = await UserQueries.GetActiveIdByClerkIdAsync(
                _db,
                clerkId,
                cancellationToken
            );

            if (userId == null)
            {
                _logger.LogWarning(
                    "Local user {ClerkId} is unavailable after synchronization.",
                    clerkId
                );

                return ErrorType.USER_ACCESS_DENIED;
            }

            return userId.Value;
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                "Clerk API request failed."
            );

            return ErrorType.CLERK_API_UNAVAILABLE;
        }
        catch (OperationCanceledException exception)
            when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(
                exception,
                "Clerk API request timed out."
            );

            return ErrorType.CLERK_API_UNAVAILABLE;
        }
        catch (JsonException exception)
        {
            _logger.LogError(
                exception,
                "Clerk API returned invalid JSON."
            );

            return ErrorType.CLERK_PAYLOAD_INVALID;
        }
    }
}
