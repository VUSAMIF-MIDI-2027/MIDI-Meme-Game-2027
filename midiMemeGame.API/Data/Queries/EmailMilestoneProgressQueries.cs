using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

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
        CancellationToken ct)
    {
        try
        {
            var exists = await _db.EmailMilestoneProgress
                .AsNoTracking()
                .AnyAsync(p => p.EventId == eventId && p.Milestone == milestone, ct);

            return exists;
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

    public async Task<Result<bool>> MarkCompletedAsync(
        string eventId,
        string milestone,
        DateTime queuedAtUtc,
        CancellationToken ct)
    {
        var entity = new EmailMilestoneProgress
        {
            EventId = eventId,
            Milestone = milestone,
            QueuedAtUtc = queuedAtUtc
        };

        try
        {
            _db.EmailMilestoneProgress.Add(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException)
        {
            _db.Entry(entity).State = EntityState.Detached;

            var exists = await _db.EmailMilestoneProgress
                .AsNoTracking()
                .AnyAsync(p => p.EventId == eventId && p.Milestone == milestone, ct);

            if (exists)
                return true;

            return ErrorType.DB_EXCEPTION;
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
}