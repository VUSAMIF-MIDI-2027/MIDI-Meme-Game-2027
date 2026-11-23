using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Memes;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class MemeQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<MemeQueries> _logger;
    public MemeQueries(AppDbContext db, ILogger<MemeQueries> logger)
    {
        _logger = logger;
        _db = db;
    }
    public async Task<Result<Meme>> UpdateAsync(
        int memeId,
        string userId,
        string caption,
        CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;

            FormattableString query = $"""
                UPDATE "Memes"
                SET
                    "Caption" = {caption},
                    "StatusId" = CASE
                        WHEN "Caption" = {caption} THEN "StatusId"
                        ELSE {(int)MemeStatus.Pending}
                    END,
                    "UpdatedAtUtc" = CASE
                        WHEN "Caption" = {caption} THEN "UpdatedAtUtc"
                        ELSE {now}
                    END
                WHERE "Id" = {memeId}
                    AND "UserId" = {userId}
                    AND "IsDeleted" = 0
                    AND "IsInvalidatedBySourcePhoto" = 0
                    AND EXISTS (
                        SELECT 1
                        FROM "SourcePhotos" AS photo
                        WHERE photo."Id" = CAST("Memes"."SourcePhotoId" AS INTEGER)
                            AND photo."IsEnabled" = 1
                    )
                RETURNING
                    "Id", "SourcePhotoId", "UserId", "StatusId", "Caption",
                    "CreatedAtUtc", "UpdatedAtUtc", "IsDeleted", "Score",
                    "IsInvalidatedBySourcePhoto";
                """;

            var memes = await _db.Memes
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (memes.Count == 0)
                return ErrorType.NOT_FOUND;

            return memes.Single();
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
    public async Task<Result<Meme>> CreateAsync(
        string sourcePhotoId,
        string userId,
        string caption,
        CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;

            FormattableString query = $"""
                INSERT INTO "Memes" (
                    "SourcePhotoId", "UserId", "StatusId", "Caption",
                    "CreatedAtUtc", "UpdatedAtUtc", "IsDeleted", "Score",
                    "IsInvalidatedBySourcePhoto"
                )
                SELECT
                    {sourcePhotoId}, {userId}, {(int)MemeStatus.Pending}, {caption},
                    {now}, {now}, 0, 0, 0
                WHERE EXISTS (
                    SELECT 1
                    FROM "SourcePhotos"
                    WHERE "Id" = CAST({sourcePhotoId} AS INTEGER)
                        AND "IsEnabled" = 1
                )
                AND (
                    SELECT COUNT(*)
                    FROM "Memes"
                    WHERE "UserId" = {userId}
                        AND "IsInvalidatedBySourcePhoto" = 0
                ) < 3
                RETURNING
                    "Id", "SourcePhotoId", "UserId", "StatusId", "Caption",
                    "CreatedAtUtc", "UpdatedAtUtc", "IsDeleted", "Score",
                    "IsInvalidatedBySourcePhoto";
                """;

            var memes = await _db.Memes
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (memes.Count == 0)
            {
                FormattableString checkPhoto = $"""
                    SELECT EXISTS (
                        SELECT 1
                        FROM "SourcePhotos"
                        WHERE "Id" = CAST({sourcePhotoId} AS INTEGER)
                            AND "IsEnabled" = 1
                    ) AS "Value"
                    """;

                var photoIsEnabled = await _db.Database
                    .SqlQuery<int>(checkPhoto)
                    .SingleAsync(cancellationToken);

                if (photoIsEnabled == 0)
                    return ErrorType.MEME_SOURCE_PHOTO_DISABLED;

                return ErrorType.MEME_LIMIT_REACHED;
            }

            return memes.Single();
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
    public async Task<Result<Meme>> UpdateAsync(
        int memeId,
        string userId,
        string sourcePhotoId,
        string caption,
        CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;

            FormattableString query = $"""
                UPDATE "Memes"
                SET
                    "SourcePhotoId" = {sourcePhotoId},
                    "Caption" = {caption},
                    "StatusId" = CASE
                        WHEN "SourcePhotoId" = {sourcePhotoId} AND "Caption" = {caption}
                        THEN "StatusId"
                        ELSE {(int)MemeStatus.Pending}
                    END,
                    "UpdatedAtUtc" = CASE
                        WHEN "SourcePhotoId" = {sourcePhotoId} AND "Caption" = {caption}
                        THEN "UpdatedAtUtc"
                        ELSE {now}
                    END
                WHERE "Id" = {memeId}
                    AND "UserId" = {userId}
                    AND "IsDeleted" = 0
                    AND "IsInvalidatedBySourcePhoto" = 0
                    AND EXISTS (
                        SELECT 1
                        FROM "SourcePhotos"
                        WHERE "Id" = CAST({sourcePhotoId} AS INTEGER)
                            AND "IsEnabled" = 1
                    )
                RETURNING
                    "Id", "SourcePhotoId", "UserId", "StatusId", "Caption",
                    "CreatedAtUtc", "UpdatedAtUtc", "IsDeleted", "Score",
                    "IsInvalidatedBySourcePhoto";
                """;

            var memes = await _db.Memes
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (memes.Count == 0)
                return ErrorType.NOT_FOUND;

            return memes.Single();
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
    public async Task<Result> DeleteAsync(int memeId, string userId, CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
            UPDATE "Memes"
            SET
                "IsDeleted" = 1,
                "UpdatedAtUtc" = {DateTime.UtcNow}
            WHERE "Id" = {memeId}
                AND "UserId" = {userId}
                AND "IsDeleted" = 0;
            """;

            var affected = await _db.Database.ExecuteSqlInterpolatedAsync(
                query, cancellationToken);

            if (affected == 0)
                return ErrorType.NOT_FOUND;

            return Result.Ok();
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);
            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }
    public async Task<Result<List<MemeResponseDto>>> GetByUserIdAsync(string userId, CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT
                    "Id",
                    CAST("SourcePhotoId" AS INTEGER) AS "SourcePhotoId",
                    "Caption",
                    "StatusId",
                    "IsInvalidatedBySourcePhoto",
                    "Score",
                    "CreatedAtUtc",
                    "UpdatedAtUtc"
                FROM "Memes"
                WHERE "UserId" = {userId}
                    AND "IsDeleted" = 0
                ORDER BY "CreatedAtUtc" DESC, "Id" DESC
                """;

            return await _db.Database
                .SqlQuery<MemeResponseDto>(query)
                .ToListAsync(cancellationToken);
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
    public async Task<Result> UpdateStatusAsync(
        int memeId,
        MemeStatus status,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                UPDATE "Memes"
                SET "StatusId" = {(int)status}
                WHERE "Id" = {memeId}
                    AND "IsDeleted" = 0
                    AND "IsInvalidatedBySourcePhoto" = 0
                    AND (
                        {(int)status} = {(int)MemeStatus.Rejected}
                        OR EXISTS (
                            SELECT 1
                            FROM "SourcePhotos" AS photo
                            WHERE photo."Id" = CAST("Memes"."SourcePhotoId" AS INTEGER)
                                AND photo."IsEnabled" = 1
                        )
                    );
                """;

            var affected = await _db.Database.ExecuteSqlInterpolatedAsync(
                query, cancellationToken);

            if (affected == 0)
                return ErrorType.NOT_FOUND;

            return Result.Ok();
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
    public async Task<Result<List<MemeResponseDto>>> GetAdminMemesAsync(
        MemeStatus? statusId,
        CancellationToken cancellationToken)
    {
        try
        {
            int? statusFilter = (int?)statusId;

            FormattableString query = $"""
                SELECT
                    m."Id",
                    CAST(m."SourcePhotoId" AS INTEGER) AS "SourcePhotoId",
                    m."Caption",
                    m."StatusId",
                    m."IsInvalidatedBySourcePhoto",
                    m."Score",
                    m."CreatedAtUtc",
                    m."UpdatedAtUtc",
                    NULLIF(TRIM(u."FirstName" || ' ' || u."LastName"), '') AS "UserName"
                FROM "Memes" AS m
                LEFT JOIN "Users" AS u ON u."Id" = m."UserId"
                WHERE m."IsDeleted" = 0
                    AND ({statusFilter} IS NULL OR m."StatusId" = {statusFilter})
                ORDER BY m."CreatedAtUtc" DESC, m."Id" DESC
                """;

            return await _db.Database
                .SqlQuery<MemeResponseDto>(query)
                .ToListAsync(cancellationToken);
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
