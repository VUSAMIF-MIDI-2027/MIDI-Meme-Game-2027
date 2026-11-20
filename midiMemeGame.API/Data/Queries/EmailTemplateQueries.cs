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
            var templates = await _db.EmailTemplates
                .AsNoTracking()
                .OrderBy(t => t.Key)
                .ToListAsync(cancellationToken);

            return templates;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }

    public async Task<Result<EmailTemplate>> GetByKeyAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            var template = await _db.EmailTemplates
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Key == key, cancellationToken);

            if (template is null)
                return ErrorType.EMAIL_TEMPLATE_NOT_FOUND;

            return template;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
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
            var template = await _db.EmailTemplates
                .FirstOrDefaultAsync(t => t.Key == key, cancellationToken);

            if (template is null)
                return ErrorType.EMAIL_TEMPLATE_NOT_FOUND;

            template.Subject = subject;
            template.Body = body;
            template.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
            return template;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }
}