using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class EmailTemplateQueries
{
    private readonly AppDbContext _db;
    private readonly ILogger<EmailTemplateQueries> _logger;

    public EmailTemplateQueries(AppDbContext db, ILogger<EmailTemplateQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<List<EmailTemplate>>> GetAllAsync(CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT "Key", "Subject", "Body", "IsHtml", "AllowedPlaceholdersJson", "UpdatedAtUtc"
                FROM "EmailTemplates"
                ORDER BY "Key"
                """;

            var templates = await _db.EmailTemplates
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return templates;
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

    public async Task<Result<EmailTemplate>> GetByKeyAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT "Key", "Subject", "Body", "IsHtml", "AllowedPlaceholdersJson", "UpdatedAtUtc"
                FROM "EmailTemplates"
                WHERE "Key" = {key}
                """;

            var template = await _db.EmailTemplates
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .SingleOrDefaultAsync(cancellationToken);

            if (template is null)
                return ErrorType.EMAIL_TEMPLATE_NOT_FOUND;

            return template;
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

    public async Task<Result<EmailTemplate>> UpdateAsync(
        string key,
        string subject,
        string body,
        CancellationToken cancellationToken)
    {
        try
        {
            var updatedAtUtc = DateTime.UtcNow;
            FormattableString query = $"""
                UPDATE "EmailTemplates"
                SET "Subject" = {subject}, "Body" = {body}, "UpdatedAtUtc" = {updatedAtUtc}
                WHERE "Key" = {key}
                RETURNING "Key", "Subject", "Body", "IsHtml", "AllowedPlaceholdersJson", "UpdatedAtUtc";
                """;

            var updated = await _db.EmailTemplates
                .FromSqlInterpolated(query)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (updated.Count == 0)
                return ErrorType.EMAIL_TEMPLATE_NOT_FOUND;

            return updated[0];
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