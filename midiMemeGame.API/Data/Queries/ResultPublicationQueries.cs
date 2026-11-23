using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Memes.Results;

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
                WHERE r."EventScheduleId" = {eventScheduleId}
                    AND r."Place" BETWEEN 1 AND 3
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