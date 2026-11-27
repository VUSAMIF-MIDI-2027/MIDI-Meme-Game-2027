using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Memes.Results;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class ResultPublicationQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<ResultPublicationQueries> _logger;

    public ResultPublicationQueries(
        AppDbContext db,
        ILogger<ResultPublicationQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public IQueryable<PublishedResultDto> GetPublicResults(DateTime now, DateTime? publicationTime = null)
    {
        var cutoff = now.AddDays(-30);
        var publications = _db.ResultPublications
            .Where(p => p.EventScheduleId == EventSchedule.SingletonId && p.PublishedAtUtc > cutoff);
        if (publicationTime.HasValue)
            publications = publications.Where(p => p.PublishedAtUtc == publicationTime.Value);

        return from publication in publications
               from row in publication.Results
               join meme in _db.Memes on row.MemeId equals meme.Id
               where row.Place >= 1 && (row.Place <= 3 || meme.GalleryPublicationAccepted)
                   && !meme.IsDeleted && !meme.IsInvalidatedBySourcePhoto
                   && meme.MemePublicationConsentedAtUtc != null && meme.MemePublicationWithdrawnAtUtc == null
               select new PublishedResultDto
               {
                   Id = row.MemeId,
                   Place = row.Place,
                   SourcePhotoId = row.SourcePhotoId,
                   Caption = row.Caption,
                   UserName = meme.NamePublicationConsentedAtUtc != null && meme.NamePublicationWithdrawnAtUtc == null
                       ? row.UserName : null,
                   StatusId = row.StatusId,
                   Score = row.Score,
                   CreatedAtUtc = row.CreatedAtUtc,
                   UpdatedAtUtc = row.UpdatedAtUtc
               };
    }

    public async Task<Result<DateTime>> GetPublishedAtAsync(
        int eventScheduleId,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT "PublishedAtUtc" AS "Value"
                FROM "ResultPublications"
                WHERE "EventScheduleId" = {eventScheduleId}
                """;

            var dates = await _db.Database
                .SqlQuery<DateTime>(query)
                .ToListAsync(cancellationToken);

            if (dates.Count == 0)
                return Result<DateTime>.None();

            return dates[0];
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

    public async Task<Result<List<AdminWinnerDto>>> GetWinnersAsync(
        int eventScheduleId,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT
                    r."MemeId" AS "Id",
                    r."Place",
                    r."SourcePhotoId",
                    r."Caption",
                    r."UserName",
                    r."StatusId",
                    r."Score",
                    r."CreatedAtUtc",
                    r."UpdatedAtUtc",
                    r."WinnerEmail" AS "Email"
                FROM "PublishedMemeResults" AS r
                INNER JOIN "Memes" AS m ON m."Id" = r."MemeId"
                WHERE r."EventScheduleId" = {eventScheduleId}
                    AND r."Place" BETWEEN 1 AND 3
                    AND m."IsDeleted" = 0
                ORDER BY r."Place"
                """;

            return await _db.Database
                .SqlQuery<AdminWinnerDto>(query)
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