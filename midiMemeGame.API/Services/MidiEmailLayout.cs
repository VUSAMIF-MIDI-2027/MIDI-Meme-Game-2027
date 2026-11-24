using System.Net;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Models;
using MimeKit;
using MimeKit.Utils;

namespace MidiMemeGame.Api.Services;

internal static class MidiEmailLayout
{
    private static readonly Lazy<byte[]> Logo = new(() => File.ReadAllBytes(
        Path.Combine(AppContext.BaseDirectory, "Assets", "Email", "MIDI.png")));

    public static void Apply(
        BodyBuilder builder, string subject, string body,
        string templateKey, EmailAttachment? attachment)
    {
        var logo = builder.LinkedResources.Add(
            "midi-email-logo.png", Logo.Value, new ContentType("image", "png"));
        logo.ContentId = MimeUtils.GenerateMessageId();

        var preview = string.Empty;
        if (attachment is not null)
        {
            var image = builder.LinkedResources.Add(
                attachment.FileName, attachment.Content, new ContentType("image", "jpeg"));
            image.ContentId = MimeUtils.GenerateMessageId();
            preview = $"""
                <div style="padding-top:22px;text-align:center;">
                    <img src="cid:{image.ContentId}" alt="Jūsų memas" width="460" align="center"
                         style="display:block;margin:0 auto;width:100%;max-width:460px;height:auto;border:1px solid #adb9c4;border-radius:12px;">
                </div>
                """;
        }

        var (status, statusColor, statusBackground) = templateKey switch
        {
            EmailTemplateKeys.MemeApproved => ("Patvirtintas", "#14532D", "#DCFCE7"),
            EmailTemplateKeys.MemeRejected => ("Atmestas", "#8C1D25", "#FDE8E7"),
            EmailTemplateKeys.MemeSubmitted => ("Pateiktas", "#104E75", "#E0F2FE"),
            EmailTemplateKeys.EventStarted => ("Memų pateikimas", "#104E75", "#E0F2FE"),
            EmailTemplateKeys.VotingOpened => ("Balsavimas", "#4C347D", "#F0E9FF"),
            EmailTemplateKeys.EventEnded => ("Konkursas baigėsi", "#334155", "#E9EFF5"),
            EmailTemplateKeys.WinnerNotification => ("Laimėjote", "#714309", "#FFF2C5"),
            _ => ("MIDI pranešimas", "#104E75", "#E0F2FE")
        };
        var catFile = templateKey switch
        {
            EmailTemplateKeys.MemeApproved => Random.Shared.Next(2) == 0 ? "trophy.png" : "medal.png",
            EmailTemplateKeys.MemeRejected => "reader.png",
            EmailTemplateKeys.MemeSubmitted => "diocat.png",
            EmailTemplateKeys.EventStarted => "astronaut.png",
            EmailTemplateKeys.VotingOpened => "diocat.png",
            EmailTemplateKeys.EventEnded => "astronaut.png",
            EmailTemplateKeys.WinnerNotification => "trophy.png",
            _ => "astronaut.png"
        };
        var catPath = Path.Combine(AppContext.BaseDirectory, "Assets", "Email", "Cats", catFile);
        var cat = builder.LinkedResources.Add(
            catFile, File.ReadAllBytes(catPath), new ContentType("image", "png"));
        cat.ContentId = MimeUtils.GenerateMessageId();

        var isRejected = templateKey == EmailTemplateKeys.MemeRejected;
        const string rulesUrl = "https://naktis.midi.lt/rules";
        const string rulesText = "Konkurso taisyklėse galite pasitikrinti, dėl kokių priežasčių memas galėjo būti atmestas.";

        var catAboveStatus = isRejected ? string.Empty : $"""
            <tr>
                <td align="center" valign="bottom" style="font-size:0;line-height:0;">
                    <img src="cid:{cat.ContentId}" alt="" width="46" height="46" align="center"
                         style="display:block;margin:0 auto;width:46px;height:46px;border:0;">
                </td>
            </tr>
            """;

        var rules = string.Empty;
        if (isRejected)
        {
            builder.TextBody += $"\n\n{rulesText}\nKonkurso taisyklės: {rulesUrl}";
            rules = $"""
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                       style="margin-top:20px;background-image:radial-gradient(ellipse 29% 48% at 29% 50%,rgba(0,117,181,0.15),transparent),radial-gradient(ellipse 33% 46% at 55% 54%,rgba(0,117,181,0.08),transparent);border-radius:12px;">
                    <tr>
                        <td align="center" valign="middle" width="66" style="padding:12px 0 12px 12px;">
                            <img src="cid:{cat.ContentId}" alt="" width="60" height="60"
                                 style="display:block;width:60px;height:60px;border:0;">
                        </td>
                        <td valign="middle" style="padding:12px 6px 12px 12px;">
                            <a href="{rulesUrl}" style="display:block;color:#20252b;text-decoration:none;">
                                <strong style="display:block;font-size:20px;line-height:1.2;">Taisyklės</strong>
                                <span style="display:block;margin-top:5px;color:#435363;font-size:14px;line-height:1.45;">
                                    {rulesText}
                                </span>
                            </a>
                        </td>
                        <td align="right" valign="middle" width="32" style="padding-right:12px;">
                            <a href="{rulesUrl}" aria-label="Konkurso taisyklės"
                               style="color:#0075b5;font-size:24px;line-height:1;text-decoration:none;">&#8594;</a>
                        </td>
                    </tr>
                </table>
                """;
        }

        var eventLink = templateKey switch
        {
            EmailTemplateKeys.EventStarted or EmailTemplateKeys.VotingOpened => "Į konkursą",
            _ => null
        };
        var eventAction = string.Empty;
        if (eventLink is not null)
        {
            const string eventUrl = "https://naktis.midi.lt/";
            builder.TextBody += $"\n\n{eventLink}: {eventUrl}";
            eventAction = $"""
                <p style="margin:22px 0 0;text-align:center;">
                    <a href="{eventUrl}" style="display:inline-block;padding:10px 18px;border-radius:8px;background-color:#075985;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                        {eventLink}
                    </a>
                </p>
                """;
        }

        var heading = WebUtility.HtmlEncode(subject);
        var content = builder.HtmlBody
            ?? WebUtility.HtmlEncode(body).ReplaceLineEndings("<br>");

        builder.HtmlBody = $"""
            <div style="padding:20px 8px;font-family:Arial,sans-serif;">
                <table role="presentation" align="center" width="100%" cellspacing="0" cellpadding="0"
                       style="width:100%;max-width:540px;margin:0 auto;border:1px solid #adb9c4;border-radius:16px;background:#ffffff;">
                    <tr>
                        <td align="center" style="padding:22px 20px 0;text-align:center;">
                            <img src="cid:{logo.ContentId}" alt="MIDI" width="72" align="center"
                                 style="display:block;margin:0 auto;width:72px;height:auto;border:0;border-radius:14px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 22px 24px;color:#20252b;">
                            <table role="presentation" align="center" cellspacing="0" cellpadding="0"
                                   style="margin:0 auto;">
                                {catAboveStatus}
                                <tr>
                                    <td align="center" style="padding:5px 12px;color:{statusColor};background-color:{statusBackground};border:1px solid {statusColor};border-radius:16px;font-size:14px;line-height:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
                                        {status}
                                    </td>
                                </tr>
                            </table>
                            <h1 style="margin:12px 0 18px;text-align:center;font-size:24px;line-height:1.25;color:#101820;">{heading}</h1>
                            <div style="font-size:16px;line-height:1.65;">{content}</div>
                            {rules}
                            {eventAction}
                            {preview}
                        </td>
                    </tr>
                </table>
            </div>
            """;
    }
}
