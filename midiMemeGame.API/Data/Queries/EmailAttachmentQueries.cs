using System;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class EmailAttachmentQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<EmailAttachmentQueries> _logger;

    public EmailAttachmentQueries(
        AppDbContext db,
        ILogger<EmailAttachmentQueries> logger)
    {
        _db = db;
        _logger = logger;
    }
    public async Task<Result> InsertAsync(
        int deliveryId,
        string fileName,
        byte[] content,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                INSERT INTO "EmailDeliveryAttachments"
                    ("DeliveryId", "FileName", "Content")
                VALUES
                    ({deliveryId}, {fileName}, {content})
                ON CONFLICT ("DeliveryId") DO NOTHING
                """;

            await _db.Database.ExecuteSqlInterpolatedAsync(
                query, cancellationToken);

            return Result.Ok();
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

    public async Task<Result<EmailAttachment>> GetByDeliveryIdAsync(
        int deliveryId,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT
                    "FileName",
                    "Content"
                FROM "EmailDeliveryAttachments"
                WHERE "DeliveryId" = {deliveryId}
                """;

            var attachment = await _db.Database
                .SqlQuery<EmailAttachment>(query)
                .SingleOrDefaultAsync(cancellationToken);

            if (attachment is null)
                return Result<EmailAttachment>.None();

            return Result<EmailAttachment>.Ok(attachment);
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
