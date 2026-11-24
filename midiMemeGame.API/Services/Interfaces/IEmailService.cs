using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Services.Interfaces;

public interface IEmailService
{
    Task<Result<EmailDelivery>> EnqueueTemplatedAsync(
        string templateKey,
        string? recipientEmail,
        IReadOnlyDictionary<string, string>? variables,
        string? deduplicationKey,
        CancellationToken cancellationToken);

    Task<Result<EmailDelivery>> EnqueueTemplatedAsync(
        EmailTemplate template,
        string? recipientEmail,
        IReadOnlyDictionary<string, string>? variables,
        string? deduplicationKey,
        CancellationToken cancellationToken);

    Task<Result<EmailDelivery>> EnqueueRawAsync(
        string? recipientEmail,
        string subject,
        string body,
        CancellationToken cancellationToken);

    Task<Result<EmailTemplate>> UpdateTemplateAsync(
        string key,
        string subject,
        string body,
        CancellationToken cancellationToken);
}