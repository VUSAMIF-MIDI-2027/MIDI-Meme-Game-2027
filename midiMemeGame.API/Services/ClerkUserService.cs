using MidiMemeGame.Api.Common.Constants;
using System.Net;
using System.Text.Json;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
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
                _logger.LogWarning(LogMessages.CLERK_USER_NOT_FOUND, clerkId);
                return ErrorType.NOT_FOUND;
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(LogMessages.CLERK_USER_REQUEST_FAILED, (int)response.StatusCode);

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
                _logger.LogWarning(LogMessages.CLERK_USER_DATA_INCOMPLETE, clerkId);

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

            var upsertResult = await _userQueries.UpsertFromClerkAsync(
                user,
                cancellationToken
            );

            if (upsertResult.IsError)
                return upsertResult.Error;

            var userIdResult = await _userQueries.GetActiveIdByClerkIdAsync(clerkId, cancellationToken);

            if (userIdResult.IsError)
            {
                if (userIdResult.Error == ErrorType.NOT_FOUND)
                    return ErrorType.USER_ACCESS_DENIED;

                return userIdResult.Error;
            }

            return userIdResult.Value;
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                LogMessages.CLERK_API_REQUEST_FAILED
            );

            return ErrorType.CLERK_API_UNAVAILABLE;
        }
        catch (OperationCanceledException exception)
            when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(
                exception,
                LogMessages.CLERK_API_TIMEOUT
            );

            return ErrorType.CLERK_API_UNAVAILABLE;
        }
        catch (JsonException exception)
        {
            _logger.LogError(
                exception,
                LogMessages.CLERK_API_INVALID_JSON
            );

            return ErrorType.CLERK_PAYLOAD_INVALID;
        }
    }
}
