using System.Net.Mail;
using System.Text.Json;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Services;

public class EmailService
{
    private readonly EmailTemplateQueries _templateQueries;
    private readonly EmailDeliveryQueries _deliveryQueries;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        EmailTemplateQueries templateQueries,
        EmailDeliveryQueries deliveryQueries,
        ILogger<EmailService> logger)
    {
        _templateQueries = templateQueries;
        _deliveryQueries = deliveryQueries;
        _logger = logger;
    }

    public async Task<Result<EmailDelivery>> EnqueueTemplatedAsync(
        string templateKey,
        string? recipientEmail,
        IReadOnlyDictionary<string, string> variables,
        string? deduplicationKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(recipientEmail))
            return ErrorType.EMAIL_RECIPIENT_MISSING;

        if (!IsValidEmail(recipientEmail))
            return ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID;

        var templateResult = await _templateQueries.GetByKeyAsync(templateKey, cancellationToken);
        if (templateResult.IsError)
            return templateResult.Error;

        var rendered = EmailTemplateHelper.Render(
            templateResult.Value.Subject,
            templateResult.Value.Body,
            variables);

        if (rendered.IsError)
            return rendered.Error;

        return await SaveToQueueAsync(
            templateKey,
            recipientEmail.Trim(),
            rendered.Value.Subject,
            rendered.Value.Body,
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

        if (!IsValidEmail(recipientEmail))
            return ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID;

        if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(body))
            return ErrorType.EMAIL_TEMPLATE_INVALID;

        return await SaveToQueueAsync(
            templateKey: null,
            recipientEmail.Trim(),
            subject.Trim(),
            body,
            deduplicationKey: null,
            cancellationToken);
    }

    private async Task<Result<EmailDelivery>> SaveToQueueAsync(
        string? templateKey,
        string recipientAddress,
        string subject,
        string body,
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

        var allowedPlaceholders = JsonSerializer.Deserialize<List<string>>(
            existingResult.Value.AllowedPlaceholdersJson) ?? [];

        var validationError = EmailTemplateHelper.ValidatePlaceholders(
            subject,
            body,
            allowedPlaceholders);

        if (validationError != ErrorType.NONE)
            return validationError;

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