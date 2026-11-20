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

            _db.EmailDeliveries.Add(delivery);
            await _db.SaveChangesAsync(cancellationToken);

            return (delivery, true);
        }
        catch (DbUpdateException) when (!string.IsNullOrEmpty(delivery.DeduplicationKey))
        {
            _db.Entry(delivery).State = EntityState.Detached;

            var existing = await _db.EmailDeliveries
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeduplicationKey == delivery.DeduplicationKey, cancellationToken);

            if (existing is not null)
                return (existing, false);

            return ErrorType.DB_EXCEPTION;
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
            var due = await _db.EmailDeliveries
                .Where(d => d.Status == EmailDeliveryStatus.Pending && d.NextAttemptAtUtc <= utcNow)
                .OrderBy(d => d.NextAttemptAtUtc)
                .ThenBy(d => d.Id)
                .Take(batchSize)
                .ToListAsync(cancellationToken);

            if (due.Count == 0)
                return due;

            foreach (var item in due)
            {
                item.Status = EmailDeliveryStatus.Processing;
            }

            await _db.SaveChangesAsync(cancellationToken);
            return due;
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
            var delivery = await _db.EmailDeliveries.FirstOrDefaultAsync(d => d.Id == deliveryId, cancellationToken);
            if (delivery is null)
                return ErrorType.NOT_FOUND;

            delivery.Status = EmailDeliveryStatus.Sent;
            delivery.AttemptCount += 1;
            delivery.SentAtUtc = sentAtUtc;
            delivery.LastError = null;

            await _db.SaveChangesAsync(cancellationToken);
            return true;
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
            var delivery = await _db.EmailDeliveries.FirstOrDefaultAsync(d => d.Id == deliveryId, cancellationToken);
            if (delivery is null)
                return ErrorType.NOT_FOUND;

            delivery.Status = EmailDeliveryStatus.Pending;
            delivery.AttemptCount += 1;
            delivery.NextAttemptAtUtc = nextAttemptAtUtc;
            delivery.LastError = TruncateError(error);

            await _db.SaveChangesAsync(cancellationToken);
            return true;
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
            var delivery = await _db.EmailDeliveries.FirstOrDefaultAsync(d => d.Id == deliveryId, cancellationToken);
            if (delivery is null)
                return ErrorType.NOT_FOUND;

            delivery.Status = EmailDeliveryStatus.Failed;
            delivery.AttemptCount += 1;
            delivery.LastError = TruncateError(error);

            await _db.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }

    public async Task<Result<List<EmailDelivery>>> GetRecentAsync(
        EmailDeliveryStatus? status,
        int limit,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = _db.EmailDeliveries.AsNoTracking();

            if (status.HasValue)
                query = query.Where(d => d.Status == status.Value);

            var items = await query
                .OrderByDescending(d => d.CreatedAtUtc)
                .ThenByDescending(d => d.Id)
                .Take(Math.Clamp(limit, 1, 200))
                .ToListAsync(cancellationToken);

            return items;
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