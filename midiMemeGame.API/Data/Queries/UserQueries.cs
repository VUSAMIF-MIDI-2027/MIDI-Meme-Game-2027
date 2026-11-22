using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Dto.Users;

namespace MidiMemeGame.Api.Data.Queries;

public class UserQueries
{
    public async Task<Result<AdminUserLookupResponse>> FindActiveByEmailAsync(
        string email, CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT 
                    "Id" AS "UserId", 
                    "FirstName", 
                    "LastName", 
                    "Email"
                FROM "Users"
                WHERE "Email" = {email} COLLATE NOCASE AND "IsDeleted" = 0
                LIMIT 2
                """;
            var users = await _db.Database
                .SqlQuery<AdminUserLookupResponse>(query)
                .ToListAsync(cancellationToken);

            if (users.Count == 0) 
                return ErrorType.NOT_FOUND;

            if (users.Count > 1) 
                return ErrorType.BAD_REQUEST;
            return users[0];
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

    private readonly AppDbContext _db;
    private readonly ILogger<UserQueries> _logger;

    public UserQueries(
        AppDbContext db,
        ILogger<UserQueries> logger)
    {
        _db = db;
        _logger = logger;
    }
    public async Task<Result<int>> ResetRulesAcknowledgementsAsync(
    CancellationToken cancellationToken)
    {
        try
        {
            const string query = """
            UPDATE "Users"
            SET "RulesAcknowledgedAtUtc" = NULL
            WHERE "RulesAcknowledgedAtUtc" IS NOT NULL;
            """;

            return await _db.Database.ExecuteSqlRawAsync(
                query,
                cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
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
    public async Task<Result<CurrentUserResponse>> GetCurrentUserAsync(string clerkId, CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT 
                    "Id" AS "UserId", 
                    "RulesAcknowledgedAtUtc"
                FROM "Users"
                WHERE "ClerkId" = {clerkId} AND "IsDeleted" = 0
                """;

            var user = await _db.Database.SqlQuery<CurrentUserResponse>(query)
                .SingleOrDefaultAsync(cancellationToken);

            if (user is null) return ErrorType.NOT_FOUND;
            return user;
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

    public async Task<Result<string>> GetActiveClerkIdByIdAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
            SELECT "ClerkId" AS "Value"
            FROM "Users"
            WHERE "Id" = {userId}
                AND "IsDeleted" = 0
            """;

            var clerkId = await _db.Database
                .SqlQuery<string>(query)
                .SingleOrDefaultAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(clerkId))
                return ErrorType.NOT_FOUND;

            return clerkId;
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
    public async Task<Result<int>> AcknowledgeRulesAsync(
    string clerkId,
    CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
            UPDATE "Users"
            SET "RulesAcknowledgedAtUtc" =
                COALESCE("RulesAcknowledgedAtUtc", {DateTime.UtcNow})
            WHERE "ClerkId" = {clerkId}
                AND "IsDeleted" = 0;
            """;

            return await _db.Database.ExecuteSqlInterpolatedAsync(
                query,
                cancellationToken);
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

    public async Task<Result<string>> GetActiveEmailByIdAsync(int userId, CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT COALESCE("Email", '') AS "Value"
                FROM "Users"
                WHERE "Id" = {userId}
                    AND "IsDeleted" = 0
                """;

            var email = await _db.Database
                .SqlQuery<string>(query)
                .SingleOrDefaultAsync(cancellationToken);

            if (email is null)
                return ErrorType.NOT_FOUND;

            if (string.IsNullOrWhiteSpace(email))
                return ErrorType.EMAIL_RECIPIENT_MISSING;

            return email;
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

    public async Task<Result<List<User>>> GetActiveEmailRecipientsAsync(CancellationToken ct)
    {
        try
        {
            FormattableString query = $"""
                SELECT
                    "Id",
                    "ClerkId",
                    "Email",
                    "FirstName",
                    "LastName",
                    "CreatedAtUtc",
                    "LastClerkUpdatedAt",
                    "RulesAcknowledgedAtUtc",
                    "IsDeleted"
                FROM "Users"
                WHERE "IsDeleted" = 0
                    AND "Email" IS NOT NULL
                    AND TRIM("Email") <> ''
                """;

            var users = await _db.Users
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(ct);

            return users;
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