using MidiMemeGame.Api.Common.Models;

namespace MidiMemeGame.Api.Services.Interfaces;

public interface IEmailSender
{
    Task<Result> SendAsync(
        int deliveryId,
        string toAddress,
        string? toName,
        string subject,
        string body,
        bool isHtml,
        CancellationToken cancellationToken);
}