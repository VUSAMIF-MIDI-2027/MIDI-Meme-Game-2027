using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class EmailDeliveryQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<EmailDeliveryQueries> _logger;

    public EmailDeliveryQueries(
        AppDbContext db, 
        ILogger<EmailDeliveryQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<(EmailDelivery Delivery, bool Created)>> EnqueueAsync(
        EmailDelivery delivery,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!string.IsNullOrEmpty(delivery.DeduplicationKey))
            {
                var existing = await _db.EmailDeliveries
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DeduplicationKey == delivery.DeduplicationKey, cancellationToken);

                if (existing is not null)
                    return (existing, false);
            }

            var status = (int)delivery.Status;
            FormattableString query = $"""
                INSERT INTO "EmailDeliveries" (
                    "TemplateKey", "RecipientAddress", "Subject", "Body", "IsHtml",
                    "Status", "AttemptCount", "NextAttemptAtUtc", "LastError",
                    "DeduplicationKey", "CreatedAtUtc", "SentAtUtc", "ClaimedAtUtc"
                )
                VALUES (
                    {delivery.TemplateKey}, {delivery.RecipientAddress}, {delivery.Subject}, {delivery.Body}, {delivery.IsHtml},
                    {status}, {delivery.AttemptCount}, {delivery.NextAttemptAtUtc}, {delivery.LastError},
                    {delivery.DeduplicationKey}, {delivery.CreatedAtUtc}, {delivery.SentAtUtc}, {delivery.ClaimedAtUtc}
                )
                ON CONFLICT ("DeduplicationKey") WHERE "DeduplicationKey" IS NOT NULL DO NOTHING
                RETURNING "Id", "TemplateKey", "RecipientAddress", "Subject", "Body", "IsHtml",
                          "Status", "AttemptCount", "NextAttemptAtUtc", "LastError",
                          "DeduplicationKey", "CreatedAtUtc", "SentAtUtc", "ClaimedAtUtc";
                """;

            var inserted = await _db.EmailDeliveries
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (inserted.Count > 0)
                return (inserted[0], true);

            if (!string.IsNullOrEmpty(delivery.DeduplicationKey))
            {
                var existing = await _db.EmailDeliveries
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DeduplicationKey == delivery.DeduplicationKey, cancellationToken);

                if (existing is not null)
                    return (existing, false);
            }

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

    public async Task<Result<List<EmailDelivery>>> ClaimPendingBatchAsync(
        int batchSize,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        try
        {
            var pending = (int)EmailDeliveryStatus.Pending;
            var processing = (int)EmailDeliveryStatus.Processing;

            FormattableString query = $"""
                UPDATE "EmailDeliveries"
                SET "Status" = {processing}, "ClaimedAtUtc" = {utcNow}
                WHERE "Id" IN (
                    SELECT "Id" FROM "EmailDeliveries"
                    WHERE "Status" = {pending} AND "NextAttemptAtUtc" <= {utcNow}
                    ORDER BY "NextAttemptAtUtc", "Id"
                    LIMIT {batchSize}
                )
                RETURNING "Id", "TemplateKey", "RecipientAddress", "Subject", "Body", "IsHtml",
                          "Status", "AttemptCount", "NextAttemptAtUtc", "LastError",
                          "DeduplicationKey", "CreatedAtUtc", "SentAtUtc", "ClaimedAtUtc";
                """;

            var due = await _db.EmailDeliveries
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return due;
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

    public async Task<Result<bool>> MarkSentAsync(int deliveryId, DateTime sentAtUtc, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _db.EmailDeliveries
                .Where(d => d.Id == deliveryId && d.Status == EmailDeliveryStatus.Processing)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(d => d.Status, EmailDeliveryStatus.Sent)
                    .SetProperty(d => d.AttemptCount, d => d.AttemptCount + 1)
                    .SetProperty(d => d.SentAtUtc, sentAtUtc)
                    .SetProperty(d => d.LastError, (string?)null)
                    .SetProperty(d => d.ClaimedAtUtc, (DateTime?)null),
                    cancellationToken);

            return updated > 0 ? true : ErrorType.NOT_FOUND;
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

    public async Task<Result<bool>> ScheduleRetryAsync(
        int deliveryId,
        DateTime nextAttemptAtUtc,
        string error,
        CancellationToken cancellationToken)
    {
        try
        {
            var truncatedError = TruncateError(error);
            var updated = await _db.EmailDeliveries
                .Where(d => d.Id == deliveryId && d.Status == EmailDeliveryStatus.Processing)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(d => d.Status, EmailDeliveryStatus.Pending)
                    .SetProperty(d => d.AttemptCount, d => d.AttemptCount + 1)
                    .SetProperty(d => d.NextAttemptAtUtc, nextAttemptAtUtc)
                    .SetProperty(d => d.LastError, truncatedError)
                    .SetProperty(d => d.ClaimedAtUtc, (DateTime?)null),
                    cancellationToken);

            return updated > 0 ? true : ErrorType.NOT_FOUND;
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

    public async Task<Result<bool>> MarkFailedAsync(
        int deliveryId,
        string error,
        CancellationToken cancellationToken)
    {
        try
        {
            var truncatedError = TruncateError(error);
            var updated = await _db.EmailDeliveries
                .Where(d => d.Id == deliveryId && d.Status == EmailDeliveryStatus.Processing)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(d => d.Status, EmailDeliveryStatus.Failed)
                    .SetProperty(d => d.AttemptCount, d => d.AttemptCount + 1)
                    .SetProperty(d => d.LastError, truncatedError)
                    .SetProperty(d => d.ClaimedAtUtc, (DateTime?)null),
                    cancellationToken);

            return updated > 0 ? true : ErrorType.NOT_FOUND;
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

    public async Task<Result<int>> ReleaseStaleAsync(DateTime cutoffUtc, CancellationToken cancellationToken)
    {
        try
        {
            var count = await _db.EmailDeliveries
                .Where(d => d.Status == EmailDeliveryStatus.Processing && d.ClaimedAtUtc < cutoffUtc)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(d => d.Status, EmailDeliveryStatus.Pending)
                    .SetProperty(d => d.ClaimedAtUtc, (DateTime?)null),
                    cancellationToken);

            return count;
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

    private static string TruncateError(string error) =>
        error.Length <= 1000 ? error : error[..1000];
}