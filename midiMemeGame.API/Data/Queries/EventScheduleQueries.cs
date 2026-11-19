using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class EventScheduleQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<EventScheduleQueries> _logger;

    public EventScheduleQueries(
        AppDbContext db,
        ILogger<EventScheduleQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<EventSchedule>> GetAsync(
        CancellationToken cancellationToken = default)
    {
        FormattableString query = $"""
            SELECT
                "Id",
                "EventStartsAt",
                "VotingStartsAt",
                "EventEndsAt"
            FROM "EventSchedule"
            WHERE "Id" = {EventSchedule.SingletonId}
            """;

        try
        {
            var schedule = await _db.EventSchedules
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .SingleOrDefaultAsync(cancellationToken);

            if (schedule is null)
                return ErrorType.EVENT_SCHEDULE_NOT_FOUND;

            return schedule;
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

    public async Task<Result<EventSchedule>> UpsertAsync(
        EventSchedule schedule,
        CancellationToken cancellationToken = default)
    {
        FormattableString query = $"""
            INSERT INTO "EventSchedule"
            (
                "Id",
                "EventStartsAt",
                "VotingStartsAt",
                "EventEndsAt"
            )
            VALUES
            (
                {EventSchedule.SingletonId},
                {schedule.EventStartsAt},
                {schedule.VotingStartsAt},
                {schedule.EventEndsAt}
            )
            ON CONFLICT ("Id") DO
                UPDATE SET
                    "EventStartsAt" = {schedule.EventStartsAt},
                    "VotingStartsAt" = {schedule.VotingStartsAt},
                    "EventEndsAt" = {schedule.EventEndsAt}
            RETURNING
                "Id",
                "EventStartsAt",
                "VotingStartsAt",
                "EventEndsAt";
            """;

        try
        {
            var schedules = await _db.EventSchedules
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return schedules.Single();
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
}
