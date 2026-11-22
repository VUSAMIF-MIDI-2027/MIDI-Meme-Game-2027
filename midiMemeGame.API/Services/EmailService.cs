using System.Net.Mail;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Services;

public class EmailService : IEmailService
{
    private readonly EmailTemplateQueries _templateQueries;
    private readonly EmailDeliveryQueries _deliveryQueries;
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        EmailTemplateQueries templateQueries,
        EmailDeliveryQueries deliveryQueries,
        IOptions<EmailSettings> settings,
        ILogger<EmailService> logger)
    {
        _templateQueries = templateQueries;
        _deliveryQueries = deliveryQueries;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<Result<EmailDelivery>> EnqueueTemplatedAsync(
        string templateKey,
        string? recipientEmail,
        IReadOnlyDictionary<string, string>? variables,
        string? deduplicationKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(templateKey))
            return ErrorType.EMAIL_TEMPLATE_INVALID;

        var templateResult = await _templateQueries.GetByKeyAsync(templateKey.Trim(), cancellationToken);
        if (templateResult.IsError)
            return templateResult.Error;

        return await EnqueueTemplatedAsync(
            templateResult.Value,
            recipientEmail,
            variables,
            deduplicationKey,
            cancellationToken);
    }

    public async Task<Result<EmailDelivery>> EnqueueTemplatedAsync(
        EmailTemplate template,
        string? recipientEmail,
        IReadOnlyDictionary<string, string>? variables,
        string? deduplicationKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(recipientEmail))
            return ErrorType.EMAIL_RECIPIENT_MISSING;

        var trimmedRecipient = recipientEmail.Trim();
        if (!IsValidEmail(trimmedRecipient))
            return ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID;

        var renderResult = EmailTemplateHelper.Render(
            template.Subject,
            template.Body,
            template.IsHtml,
            variables ?? new Dictionary<string, string>());

        if (renderResult.IsError)
            return renderResult.Error;

        return await SaveToQueueAsync(
            template.Key,
            trimmedRecipient,
            renderResult.Value.Subject,
            renderResult.Value.Body,
            template.IsHtml,
            deduplicationKey,
            cancellationToken);
    }

    public async Task<Result<EmailDelivery>> EnqueueRawAsync(
        string? recipientEmail,
        string subject,
        string body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(recipientEmail))
            return ErrorType.EMAIL_RECIPIENT_MISSING;

        var trimmedRecipient = recipientEmail.Trim();
        if (!IsValidEmail(trimmedRecipient))
            return ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID;

        var trimmedSubject = subject.Trim();
        if (string.IsNullOrWhiteSpace(trimmedSubject)
            || trimmedSubject.Length > _settings.MaxSubjectLength
            || string.IsNullOrWhiteSpace(body)
            || body.Length > _settings.MaxBodyLength)
            return ErrorType.EMAIL_TEMPLATE_INVALID;

        return await SaveToQueueAsync(
            templateKey: null,
            trimmedRecipient,
            trimmedSubject,
            body,
            isHtml: false,
            deduplicationKey: null,
            cancellationToken);
    }

    private async Task<Result<EmailDelivery>> SaveToQueueAsync(
        string? templateKey,
        string recipientAddress,
        string subject,
        string body,
        bool isHtml,
        string? deduplicationKey,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var delivery = new EmailDelivery
        {
            TemplateKey = templateKey,
            RecipientAddress = recipientAddress,
            Subject = subject,
            Body = body,
            IsHtml = isHtml,
            Status = EmailDeliveryStatus.Pending,
            AttemptCount = 0,
            NextAttemptAtUtc = now,
            DeduplicationKey = deduplicationKey,
            CreatedAtUtc = now
        };

        var result = await _deliveryQueries.EnqueueAsync(delivery, cancellationToken);
        if (result.IsError)
            return result.Error;

        if (result.Value.Created)
            _logger.LogInformation(LogMessages.Email.QUEUED, result.Value.Delivery.Id, templateKey ?? "manual");

        return result.Value.Delivery;
    }

    public async Task<Result<EmailTemplate>> UpdateTemplateAsync(
        string key,
        string subject,
        string body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(body))
            return ErrorType.EMAIL_TEMPLATE_INVALID;

        var existingResult = await _templateQueries.GetByKeyAsync(key, cancellationToken);
        if (existingResult.IsError)
            return existingResult.Error;

        var allowedPlaceholders = EmailTemplateHelper.ParseAllowedPlaceholders(
            existingResult.Value.AllowedPlaceholdersJson);

        if (!EmailTemplateHelper.IsValidTemplate(
                subject, 
                body, 
                allowedPlaceholders, 
                _settings.MaxSubjectLength,
                _settings.MaxBodyLength))
            return ErrorType.EMAIL_TEMPLATE_INVALID;

        return await _templateQueries.UpdateAsync(
            key,
            subject.Trim(),
            body,
            cancellationToken);
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new MailAddress(email.Trim());
            return addr.Address == email.Trim();
        }
        catch
        {
            return false;
        }
    }
}