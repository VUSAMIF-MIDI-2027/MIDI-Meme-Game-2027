using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class SourcePhotoQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<SourcePhotoQueries> _logger;

    public SourcePhotoQueries(
        AppDbContext db,
        ILogger<SourcePhotoQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<List<SourcePhoto>>> GetAllAsync(
        bool? IsEnabled,
        CancellationToken cancellationToken = default)
    {
        FormattableString query =
            $"""
            SELECT
                "Id",
                "FileId",
                "OriginalFileName",
                "RelativeFilePath",
                "ContentType",
                "SizeBytes",
                "IsEnabled",
                "UploadedAtUtc"
            FROM "SourcePhotos"
            WHERE ({IsEnabled} IS NULL OR "IsEnabled" = {IsEnabled})
            ORDER BY
                "UploadedAtUtc" DESC,
                "Id" DESC
            """;

        try
        {
            var photos = await _db.SourcePhotos
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return photos;
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

    public async Task<Result<SourcePhoto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        FormattableString query = $"""
            SELECT
                "Id",
                "FileId",
                "OriginalFileName",
                "RelativeFilePath",
                "ContentType",
                "SizeBytes",
                "IsEnabled",
                "UploadedAtUtc"
            FROM "SourcePhotos"
            WHERE "Id" = {id}
            """;

        try
        {
            var photo = await _db.SourcePhotos
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .SingleOrDefaultAsync(cancellationToken);

            if (photo is null)
                return ErrorType.NOT_FOUND;

            return photo;
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

    public async Task<Result<SourcePhoto>> AddAsync(
        SourcePhoto photo,
        CancellationToken cancellationToken = default)
    {
        FormattableString query = $"""
            INSERT INTO "SourcePhotos"
            (
                "FileId",
                "OriginalFileName",
                "RelativeFilePath",
                "ContentType",
                "SizeBytes",
                "IsEnabled",
                "UploadedAtUtc"
            )
            VALUES
            (
                {photo.FileId},
                {photo.OriginalFileName},
                {photo.RelativeFilePath},
                {photo.ContentType},
                {photo.SizeBytes},
                {photo.IsEnabled},
                {photo.UploadedAtUtc}
            )
            RETURNING
                "Id",
                "FileId",
                "OriginalFileName",
                "RelativeFilePath",
                "ContentType",
                "SizeBytes",
                "IsEnabled",
                "UploadedAtUtc";
            """;

        try
        {
            var photos = await _db.SourcePhotos
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return photos.Single();
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

    public async Task<Result<SourcePhoto>> UpdateEnabledAsync(int id, bool isEnabled, CancellationToken cancellationToken)
    {
        try
        {
            var photo = await _db.SourcePhotos.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
            if (photo is null) return ErrorType.NOT_FOUND;
            photo.IsEnabled = isEnabled;
            await _db.SaveChangesAsync(cancellationToken);
            return photo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }
}
