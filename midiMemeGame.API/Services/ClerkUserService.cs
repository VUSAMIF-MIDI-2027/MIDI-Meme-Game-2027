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
    private readonly UserQueries _userQueries;
    private readonly ILogger<ClerkUserService> _logger;

    public ClerkUserService(
        HttpClient httpClient,
        UserQueries userQueries,
        ILogger<ClerkUserService> logger
    )
    {
        _httpClient = httpClient;
        _userQueries = userQueries;
        _logger = logger;
    }
    public async Task<Result> GrantAdminAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var userResult = await _userQueries.GetActiveClerkIdByIdAsync(
            userId,
            cancellationToken);

        if (userResult.IsError)
            return userResult.Error;

        try
        {
            var payload = new
            {
                public_metadata = new
                {
                    role = "admin"
                }
            };

            using var response = await _httpClient.PatchAsJsonAsync(
                $"users/{Uri.EscapeDataString(userResult.Value)}/metadata",
                payload,
                cancellationToken);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return ErrorType.NOT_FOUND;

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Failed to grant admin role. Clerk status: {StatusCode}",
                    (int)response.StatusCode);

                return ErrorType.CLERK_API_UNAVAILABLE;
            }

            return Result.Ok();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Clerk API request failed.");
            return ErrorType.CLERK_API_UNAVAILABLE;
        }
        catch (OperationCanceledException ex)
            when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(ex, "Clerk API request timed out.");
            return ErrorType.CLERK_API_UNAVAILABLE;
        }
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
                _logger.LogWarning("Clerk user {ClerkId} was not found.", clerkId);
                return ErrorType.NOT_FOUND;
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Clerk user request failed with status {StatusCode}.", (int)response.StatusCode);

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
                _logger.LogWarning("Clerk returned incomplete user data for {ClerkId}.", clerkId);

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

            await _userQueries.UpsertFromClerkAsync(
                user,
                cancellationToken
            );

            var userId = await _userQueries.GetActiveIdByClerkIdAsync(
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
