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
        bool IsEnabled,
        CancellationToken cancellationToken = default)
    {
        FormattableString query =
            $"""
            SELECT
                "Id",
                "FileId",
                "OriginalFileName",
                "ContentType",
                "SizeBytes",
                "IsEnabled",
                "UploadedAtUtc"
            FROM "SourcePhotos"
            WHERE "IsEnabled" = {IsEnabled}
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
}