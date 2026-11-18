using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class UserQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserQueries> _logger;

    public UserQueries(
        AppDbContext db,
        ILogger<UserQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<int>> UpsertFromClerkAsync(
        User user,
        CancellationToken cancellationToken)
    {
        FormattableString query =
            $"""
            INSERT INTO "Users"
            (
                "ClerkId",
                "Email",
                "FirstName",
                "LastName",
                "CreatedAtUtc",
                "LastClerkUpdatedAt",
                "IsDeleted"
            )
            VALUES
            (
                {user.ClerkId},
                {user.Email},
                {user.FirstName},
                {user.LastName},
                {user.CreatedAtUtc},
                {user.LastClerkUpdatedAt},
                0
            )
            ON CONFLICT ("ClerkId") DO
                UPDATE SET
                    "Email" = {user.Email},
                    "FirstName" = {user.FirstName},
                    "LastName" = {user.LastName},
                    "LastClerkUpdatedAt" = {user.LastClerkUpdatedAt}
                WHERE
                    "Users"."IsDeleted" = 0
                    AND "Users"."LastClerkUpdatedAt" < {user.LastClerkUpdatedAt};
            """;

        try
        {
            var affectedRows = await _db.Database.ExecuteSqlInterpolatedAsync(
                query,
                cancellationToken);

            return affectedRows;
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);

            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);

            return ErrorType.DB_EXCEPTION;
        }
    }

    public async Task<Result<int>> MarkDeletedFromClerkAsync(
        string clerkId,
        CancellationToken cancellationToken)
    {
        FormattableString query =
            $"""
            UPDATE "Users"
            SET
                "IsDeleted" = 1
            WHERE
                "ClerkId" = {clerkId};
            """;

        try
        {
            var affectedRows = await _db.Database.ExecuteSqlInterpolatedAsync(
                query,
                cancellationToken);

            return affectedRows;
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);

            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);

            return ErrorType.DB_EXCEPTION;
        }
    }

    public async Task<Result<int>> GetActiveIdByClerkIdAsync(
    string clerkId,
    CancellationToken cancellationToken)
    {
        FormattableString query =
            $"""
        SELECT "Id" AS "Value"
        FROM "Users"
        WHERE
            "ClerkId" = {clerkId}
            AND "IsDeleted" = 0
        """;

        try
        {
            var userId = await _db.Database.SqlQuery<int?>(query).SingleOrDefaultAsync(cancellationToken);

            if (userId is null)
                return ErrorType.NOT_FOUND;

            return userId.Value;
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);

            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);

            return ErrorType.DB_EXCEPTION;
        }
    }
}