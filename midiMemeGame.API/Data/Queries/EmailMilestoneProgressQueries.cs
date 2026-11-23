using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class EmailMilestoneProgressQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<EmailMilestoneProgressQueries> _logger;

    public EmailMilestoneProgressQueries(
        AppDbContext db,
        ILogger<EmailMilestoneProgressQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<bool>> IsCompletedAsync(
        string eventId,
        string milestone,
        string occurrenceKey,
        DateTime scheduledAtUtc,
        CancellationToken ct)
    {
        try
        {
            FormattableString query = $"""
                SELECT 1 AS "Value"
                FROM "EmailMilestoneProgress"
                WHERE "EventId" = {eventId}
                    AND (
                        "Milestone" = {occurrenceKey}
                        OR ("Milestone" = {milestone} AND "QueuedAtUtc" >= {scheduledAtUtc})
                    )
                LIMIT 1
                """;

            var exists = await _db.Database
                .SqlQuery<int>(query)
                .AnyAsync(ct);

            return exists;
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

    public async Task<Result<bool>> MarkCompletedAsync(
        string eventId,
        string milestone,
        DateTime queuedAtUtc,
        CancellationToken ct)
    {
        try
        {
            FormattableString query = $"""
                INSERT INTO "EmailMilestoneProgress" ("EventId", "Milestone", "QueuedAtUtc")
                VALUES ({eventId}, {milestone}, {queuedAtUtc})
                ON CONFLICT ("EventId", "Milestone") DO NOTHING
                """;

            await _db.Database.ExecuteSqlInterpolatedAsync(query, ct);
            return true;
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