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
            var status = (int)delivery.Status;
            FormattableString insertQuery = $"""
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
                ON CONFLICT ("DeduplicationKey") DO NOTHING
                RETURNING "Id", "TemplateKey", "RecipientAddress", "Subject", "Body", "IsHtml",
                          "Status", "AttemptCount", "NextAttemptAtUtc", "LastError",
                          "DeduplicationKey", "CreatedAtUtc", "SentAtUtc", "ClaimedAtUtc";
                """;

            var inserted = await _db.EmailDeliveries
                .FromSqlInterpolated(insertQuery)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (inserted.Count > 0)
                return (inserted[0], true);

            if (!string.IsNullOrEmpty(delivery.DeduplicationKey))
            {
                FormattableString selectQuery = $"""
                    SELECT "Id", "TemplateKey", "RecipientAddress", "Subject", "Body", "IsHtml",
                           "Status", "AttemptCount", "NextAttemptAtUtc", "LastError",
                           "DeduplicationKey", "CreatedAtUtc", "SentAtUtc", "ClaimedAtUtc"
                    FROM "EmailDeliveries"
                    WHERE "DeduplicationKey" = {delivery.DeduplicationKey}
                    """;

                var existing = await _db.EmailDeliveries
                    .FromSqlInterpolated(selectQuery)
                    .AsNoTracking()
                    .SingleOrDefaultAsync(cancellationToken);

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
        catch (Exception ex)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }

    public async Task<Result<bool>> MarkSentAsync(int deliveryId, DateTime sentAtUtc, CancellationToken cancellationToken)
    {
        try
        {
            var processing = (int)EmailDeliveryStatus.Processing;
            var sent = (int)EmailDeliveryStatus.Sent;

            FormattableString query = $"""
                UPDATE "EmailDeliveries"
                SET "Status" = {sent},
                    "AttemptCount" = "AttemptCount" + 1,
                    "SentAtUtc" = {sentAtUtc},
                    "LastError" = NULL,
                    "ClaimedAtUtc" = NULL
                WHERE "Id" = {deliveryId} AND "Status" = {processing}
                """;

            var updated = await _db.Database.ExecuteSqlInterpolatedAsync(query, cancellationToken);
            return updated > 0 ? true : ErrorType.NOT_FOUND;
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

    public async Task<Result<bool>> ScheduleRetryAsync(
        int deliveryId,
        DateTime nextAttemptAtUtc,
        string error,
        CancellationToken cancellationToken)
    {
        try
        {
            var truncatedError = TruncateError(error);
            var processing = (int)EmailDeliveryStatus.Processing;
            var pending = (int)EmailDeliveryStatus.Pending;

            FormattableString query = $"""
                UPDATE "EmailDeliveries"
                SET "Status" = {pending},
                    "AttemptCount" = "AttemptCount" + 1,
                    "NextAttemptAtUtc" = {nextAttemptAtUtc},
                    "LastError" = {truncatedError},
                    "ClaimedAtUtc" = NULL
                WHERE "Id" = {deliveryId} AND "Status" = {processing}
                """;

            var updated = await _db.Database.ExecuteSqlInterpolatedAsync(query, cancellationToken);
            return updated > 0 ? true : ErrorType.NOT_FOUND;
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

    public async Task<Result<bool>> MarkFailedAsync(
        int deliveryId,
        string error,
        CancellationToken cancellationToken)
    {
        try
        {
            var truncatedError = TruncateError(error);
            var processing = (int)EmailDeliveryStatus.Processing;
            var failed = (int)EmailDeliveryStatus.Failed;

            FormattableString query = $"""
                UPDATE "EmailDeliveries"
                SET "Status" = {failed},
                    "AttemptCount" = "AttemptCount" + 1,
                    "LastError" = {truncatedError},
                    "ClaimedAtUtc" = NULL
                WHERE "Id" = {deliveryId} AND "Status" = {processing}
                """;

            var updated = await _db.Database.ExecuteSqlInterpolatedAsync(query, cancellationToken);
            return updated > 0 ? true : ErrorType.NOT_FOUND;
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

    public async Task<Result<int>> ReleaseWithoutAttemptAsync(
        IReadOnlyCollection<int> deliveryIds,
        DateTime nextAttemptAtUtc,
        string error,
        CancellationToken cancellationToken)
    {
        if (deliveryIds.Count == 0)
            return 0;

        try
        {
            var truncatedError = TruncateError(error);
            var processing = (int)EmailDeliveryStatus.Processing;
            var pending = (int)EmailDeliveryStatus.Pending;

            var parameters = new List<object> { pending, nextAttemptAtUtc, truncatedError, processing };
            var idPlaceholders = new List<string>(deliveryIds.Count);

            foreach (var id in deliveryIds)
            {
                idPlaceholders.Add($"@p{parameters.Count}");
                parameters.Add(id);
            }

            var sql = $"""
                UPDATE "EmailDeliveries"
                SET "Status" = @p0,
                    "NextAttemptAtUtc" = @p1,
                    "LastError" = @p2,
                    "ClaimedAtUtc" = NULL
                WHERE "Id" IN ({string.Join(", ", idPlaceholders)}) AND "Status" = @p3
                """;

            var count = await _db.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);
            return count;
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

    public async Task<Result<int>> ReleaseStaleAsync(DateTime cutoffUtc, CancellationToken cancellationToken)
    {
        try
        {
            var processing = (int)EmailDeliveryStatus.Processing;
            var pending = (int)EmailDeliveryStatus.Pending;

            FormattableString query = $"""
                UPDATE "EmailDeliveries"
                SET "Status" = {pending},
                    "ClaimedAtUtc" = NULL
                WHERE "Status" = {processing} AND "ClaimedAtUtc" < {cutoffUtc}
                """;

            var count = await _db.Database.ExecuteSqlInterpolatedAsync(query, cancellationToken);
            return count;
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

    private static string TruncateError(string error) =>
        error.Length <= 1000 ? error : error[..1000];
}