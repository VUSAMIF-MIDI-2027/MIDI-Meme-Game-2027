using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Services;

public class SmtpEmailSender : IEmailSender
{
    private const int SmtpTimeoutMs = 15_000;
    private readonly SmtpSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;
    private readonly ILoggerFactory _loggerFactory;

    public SmtpEmailSender(IOptions<SmtpSettings> settings, ILogger<SmtpEmailSender> logger, ILoggerFactory loggerFactory)
    {
        _settings = settings.Value;
        _logger = logger;
        _loggerFactory = loggerFactory;
    }

    public async Task<Result<IEmailSendSession>> OpenSessionAsync(CancellationToken cancellationToken)
    {
        var client = new SmtpClient
        {
            Timeout = SmtpTimeoutMs,
            CheckCertificateRevocation = false
        };

        try
        {
            await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
            return new SmtpSendSession(client, _settings, _loggerFactory.CreateLogger<SmtpSendSession>());
        }
        catch (OperationCanceledException)
        {
            client.Dispose();
            throw;
        }
        catch (Exception ex)
        {
            client.Dispose();
            _logger.LogWarning(ex, LogMessages.Email.SMTP_ERROR, 0);

            if (ex is SmtpCommandException cmdEx)
            {
                var code = (int)cmdEx.StatusCode;

                if (IsQuotaExceeded(cmdEx))
                    return ErrorType.EMAIL_SMTP_QUOTA_EXCEEDED;

                return code is >= 400 and < 500
                    ? ErrorType.EMAIL_SMTP_TRANSIENT_FAILURE
                    : ErrorType.EMAIL_SMTP_PERMANENT_FAILURE;
            }

            return ErrorType.EMAIL_SMTP_TRANSIENT_FAILURE;
        }
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
        var sessionResult = await OpenSessionAsync(cancellationToken);
        if (sessionResult.IsError)
            return sessionResult.Error;

        await using var session = sessionResult.Value;
        return await session.SendAsync(deliveryId, toAddress, toName, subject, body, isHtml, cancellationToken);
    }

    internal static bool IsQuotaExceeded(SmtpCommandException ex)
    {
        var message = ex.Message;
        return message.Contains("5.4.5", StringComparison.OrdinalIgnoreCase)
            || message.Contains("Daily user sending quota exceeded", StringComparison.OrdinalIgnoreCase)
            || message.Contains("quota exceeded", StringComparison.OrdinalIgnoreCase);
    }
}