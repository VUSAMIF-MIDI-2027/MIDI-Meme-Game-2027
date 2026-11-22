using System.Net.Sockets;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;
using MimeKit;

namespace MidiMemeGame.Api.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpSettings> settings, ILogger<SmtpEmailSender> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<Result> SendAsync(
        int deliveryId,
        string toAddress,
        string? toName,
        string subject,
        string body,
        bool isHtml,
        CancellationToken cancellationToken)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
            message.To.Add(new MailboxAddress(toName ?? string.Empty, toAddress));
            message.Subject = subject;

            var builder = new BodyBuilder();
            if (isHtml)
                builder.HtmlBody = body;
            else
                builder.TextBody = body;

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            client.CheckCertificateRevocation = false;
            await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            return Result.Ok();
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogWarning(ex, LogMessages.Email.SMTP_ERROR, deliveryId);

            if (IsQuotaExceeded(ex))
                return ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;

            var code = (int)ex.StatusCode;
            return code is >= 400 and < 500
                ? ErrorType.EMAIL_SMTP_TRANSIENT_FAILURE
                : ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
        }
        catch (Exception ex) when (ex is SmtpProtocolException
                                      or ServiceNotConnectedException
                                      or ServiceNotAuthenticatedException
                                      or SocketException
                                      or IOException
                                      or TimeoutException)
        {
            _logger.LogWarning(ex, LogMessages.Email.SMTP_ERROR, deliveryId);
            return ErrorType.EMAIL_SMTP_TRANSIENT_FAILURE;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, LogMessages.Email.SMTP_ERROR, deliveryId);
            return ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
        }
    }

    private static bool IsQuotaExceeded(SmtpCommandException ex)
    {
        var message = ex.Message;
        return message.Contains("5.4.5", StringComparison.OrdinalIgnoreCase)
            || message.Contains("Daily user sending quota exceeded", StringComparison.OrdinalIgnoreCase)
            || message.Contains("quota exceeded", StringComparison.OrdinalIgnoreCase);
    }
}