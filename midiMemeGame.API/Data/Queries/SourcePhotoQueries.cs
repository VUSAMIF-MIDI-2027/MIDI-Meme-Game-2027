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

    public async Task<Result<SourcePhoto>> GetFileAccessAsync(int id, bool isAuthenticated, CancellationToken cancellationToken)
    {
        try
        {
            var photo = await _db.SourcePhotos.AsNoTracking()
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
            if (photo is null) return ErrorType.NOT_FOUND;
            var isUsedByApprovedMeme = await _db.Memes.AsNoTracking().AnyAsync(
                meme => meme.SourcePhotoId == id.ToString() && meme.Status == MemeStatus.Approved && !meme.IsDeleted,
                cancellationToken);
            return isUsedByApprovedMeme || (isAuthenticated && photo.IsEnabled) ? photo : ErrorType.NOT_FOUND;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }

    public async Task<Result<SourcePhoto>> AddAsync(SourcePhoto photo, CancellationToken cancellationToken)
    {
        try
        {
            _db.SourcePhotos.Add(photo);
            await _db.SaveChangesAsync(cancellationToken);
            return photo;
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
