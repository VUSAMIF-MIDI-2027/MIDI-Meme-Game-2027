using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;
using MimeKit;

namespace MidiMemeGame.Api.Services;

internal sealed class SmtpSendSession : IEmailSendSession
{
    private readonly SmtpClient _client;
    private readonly SmtpSettings _settings;
    private readonly ILogger<SmtpSendSession> _logger;

    public SmtpSendSession(SmtpClient client, SmtpSettings settings, ILogger<SmtpSendSession> logger)
    {
        _client = client;
        _settings = settings;
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
            if (!_client.IsConnected)
                await _client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls, cancellationToken);

            if (!_client.IsAuthenticated)
                await _client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
            message.To.Add(new MailboxAddress(toName ?? string.Empty, toAddress));
            message.Subject = subject;

            var builder = new BodyBuilder();
            if (isHtml)
            {
                builder.HtmlBody = body;
                builder.TextBody = WebUtility.HtmlDecode(Regex.Replace(body, "<[^>]+>", " ")).Trim();
            }
            else
            {
                builder.TextBody = body;
            }

            message.Body = builder.ToMessageBody();

            await _client.SendAsync(message, cancellationToken);
            return Result.Ok();
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogWarning(ex, LogMessages.Email.SMTP_ERROR, deliveryId);

            var code = (int)ex.StatusCode;

            if (SmtpEmailSender.IsQuotaExceeded(ex))
                return ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;

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

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_client.IsConnected)
                await _client.DisconnectAsync(true);
        }
        catch
        {
        }
        finally
        {
            _client.Dispose();
        }
    }
}