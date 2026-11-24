using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Email;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Helpers;

public static class EmailTemplateHelper
{
    private static readonly Regex PlaceholderRegex = new(@"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}");

    public static IReadOnlyList<string> ParseAllowedPlaceholders(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];

        try
        {
            return JsonSerializer.Deserialize<string[]>(json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static bool IsValidTemplate(
        string subject,
        string body,
        IEnumerable<string> allowedPlaceholders,
        int maxSubjectLength,
        int maxBodyLength)
    {
        var trimmedSubject = subject.Trim();
        if (trimmedSubject.Length == 0 || trimmedSubject.Length > maxSubjectLength)
            return false;

        if (string.IsNullOrWhiteSpace(body) || body.Length > maxBodyLength)
            return false;

        var allowed = new HashSet<string>(allowedPlaceholders, StringComparer.Ordinal);
        return IsTextValid(subject, allowed) && IsTextValid(body, allowed);
    }

    private static bool IsTextValid(string text, HashSet<string> allowed)
    {
        var stripped = PlaceholderRegex.Replace(text, string.Empty);
        if (stripped.Contains("{{") || stripped.Contains("}}"))
            return false;

        return PlaceholderRegex.Matches(text).All(m => allowed.Contains(m.Groups[1].Value));
    }

    public static Result<RenderedEmailContent> Render(
        string subjectTemplate,
        string bodyTemplate,
        bool isHtml,
        IReadOnlyDictionary<string, string> variables)
    {
        if (!TryRenderText(subjectTemplate, variables, htmlEncode: false, out var renderedSubject))
            return ErrorType.EMAIL_TEMPLATE_VARIABLE_MISSING;

        if (!TryRenderText(bodyTemplate, variables, htmlEncode: isHtml, out var renderedBody))
            return ErrorType.EMAIL_TEMPLATE_VARIABLE_MISSING;

        return new RenderedEmailContent
        {
            Subject = renderedSubject,
            Body = renderedBody
        };
    }

    private static bool TryRenderText(
        string template,
        IReadOnlyDictionary<string, string> variables,
        bool htmlEncode,
        out string renderedText)
    {
        var missing = false;

        renderedText = PlaceholderRegex.Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            if (!variables.TryGetValue(key, out var rawValue))
            {
                missing = true;
                return match.Value;
            }

            return htmlEncode ? WebUtility.HtmlEncode(rawValue) : rawValue;
        });

        return !missing;
    }

    public static string BuildRecipientName(string? firstName, string? lastName = null)
    {
        var trimmedFirst = firstName?.Trim();
        if (!string.IsNullOrWhiteSpace(trimmedFirst))
            return trimmedFirst;

        return "Dalyvi";
    }
}