using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Services.Interfaces;

public interface IEmailSender
{
    Task<Result<IEmailSendSession>> OpenSessionAsync(CancellationToken cancellationToken);

    Task<Result> SendAsync(
        int deliveryId,
        string toAddress,
        string? toName,
        string subject,
        string body,
        bool isHtml,
        CancellationToken cancellationToken);
}

public interface IEmailSendSession : IAsyncDisposable
{
    Task<Result> SendAsync(
        int deliveryId,
        string toAddress,
        string? toName,
        string subject,
        string body,
        bool isHtml,
        CancellationToken cancellationToken,
        EmailAttachment? attachment = null,
        string? templateKey = null);
}