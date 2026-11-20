using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;

namespace MidiMemeGame.Api.Helpers;

public static class EmailTemplateHelper
{
    private static readonly Regex PlaceholderRegex = new(@"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}");
    private static readonly Regex HtmlTagRegex = new(@"<[^>]+>");

    public static bool IsHtml(string text) => HtmlTagRegex.IsMatch(text);

    public static IReadOnlyList<string> ParseAllowedPlaceholders(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];

        return JsonSerializer.Deserialize<string[]>(json) ?? [];
    }

    public static ErrorType ValidatePlaceholders(
        string subject,
        string body,
        IEnumerable<string> allowedPlaceholders)
    {
        var allowed = new HashSet<string>(allowedPlaceholders, StringComparer.Ordinal);

        if (!IsTextValid(subject, allowed) || !IsTextValid(body, allowed))
            return ErrorType.EMAIL_TEMPLATE_INVALID;

        return ErrorType.NONE;
    }

    private static bool IsTextValid(string text, HashSet<string> allowed)
    {
        var stripped = PlaceholderRegex.Replace(text, string.Empty);
        if (stripped.Contains("{{") || stripped.Contains("}}"))
            return false;

        foreach (Match match in PlaceholderRegex.Matches(text))
        {
            var name = match.Groups[1].Value;
            if (!allowed.Contains(name))
                return false;
        }

        return true;
    }

    public static Result<(string Subject, string Body)> Render(
        string subjectTemplate,
        string bodyTemplate,
        IReadOnlyDictionary<string, string> variables)
    {
        var renderedSubject = RenderText(subjectTemplate, variables, htmlEncode: false, out var missingSubjectVar);
        if (missingSubjectVar is not null)
            return ErrorType.EMAIL_TEMPLATE_VARIABLE_MISSING;

        var renderedBody = RenderText(bodyTemplate, variables, htmlEncode: IsHtml(bodyTemplate), out var missingBodyVar);
        if (missingBodyVar is not null)
            return ErrorType.EMAIL_TEMPLATE_VARIABLE_MISSING;

        return (renderedSubject, renderedBody);
    }

    private static string RenderText(
        string template,
        IReadOnlyDictionary<string, string> variables,
        bool htmlEncode,
        out string? missingVariable)
    {
        string? missing = null;

        var result = PlaceholderRegex.Replace(template, match =>
        {
            var key = match.Groups[1].Value;
            if (!variables.TryGetValue(key, out var rawValue))
            {
                missing ??= key;
                return match.Value;
            }

            return htmlEncode ? WebUtility.HtmlEncode(rawValue) : rawValue;
        });

        missingVariable = missing;
        return result;
    }
}