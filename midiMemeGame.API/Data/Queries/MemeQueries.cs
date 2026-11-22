using System;
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
                    "SourcePhotoId", 
                    "UserId", 
                    "StatusId", 
                    "Caption",
                    "CreatedAtUtc", 
                    "UpdatedAtUtc", 
                    "IsDeleted", 
                    "Score"
                )
                VALUES (
                    {sourcePhotoId}, 
                    {userId}, 
                    {(int)MemeStatus.Pending}, 
                    {caption},
                    {now}, 
                    {now}, 
                    0, 
                    0
                )
                RETURNING
                    "Id", 
                    "SourcePhotoId", 
                    "UserId", 
                    "StatusId", 
                    "Caption",
                    "CreatedAtUtc", 
                    "UpdatedAtUtc", 
                    "IsDeleted", 
                    "Score";
                """;

            var memes = await _db.Memes
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

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
                        ELSE {DateTime.UtcNow}
                    END
                WHERE "Id" = {memeId} AND "UserId" = {userId} AND "IsDeleted" = 0
                RETURNING
                    "Id", 
                    "SourcePhotoId", 
                    "UserId", 
                    "StatusId", 
                    "Caption",
                    "CreatedAtUtc", 
                    "UpdatedAtUtc", 
                    "IsDeleted", 
                    "Score";
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
            SET "IsDeleted" = 1,
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
}
