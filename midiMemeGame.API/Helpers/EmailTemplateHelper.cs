using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;

namespace MidiMemeGame.Api.Helpers;

public static class EmailTemplateHelper
{
    public const int MaxSubjectLength = 200;
    public const int MaxBodyLength = 50_000;

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

    public static IReadOnlyList<string> ValidateTemplate(
        string subject,
        string body,
        IEnumerable<string> allowedPlaceholders)
    {
        var reasons = new List<string>();
        var trimmedSubject = subject.Trim();

        if (string.IsNullOrWhiteSpace(trimmedSubject))
            reasons.Add("Subject cannot be empty.");
        else if (trimmedSubject.Length > MaxSubjectLength)
            reasons.Add($"Subject cannot exceed {MaxSubjectLength} characters (got {trimmedSubject.Length}).");

        if (string.IsNullOrWhiteSpace(body))
            reasons.Add("Body cannot be empty.");
        else if (body.Length > MaxBodyLength)
            reasons.Add($"Body cannot exceed {MaxBodyLength} characters (got {body.Length}).");

        var allowed = new HashSet<string>(allowedPlaceholders, StringComparer.Ordinal);
        CollectPlaceholderErrors("Subject", subject, allowed, reasons);
        CollectPlaceholderErrors("Body", body, allowed, reasons);

        return reasons;
    }

    private static void CollectPlaceholderErrors(
        string fieldName,
        string text,
        HashSet<string> allowed,
        List<string> reasons)
    {
        var stripped = PlaceholderRegex.Replace(text, string.Empty);
        if (stripped.Contains("{{") || stripped.Contains("}}"))
            reasons.Add($"{fieldName} contains malformed or unclosed placeholder braces.");

        var invalidNames = new HashSet<string>(StringComparer.Ordinal);
        foreach (Match match in PlaceholderRegex.Matches(text))
        {
            var name = match.Groups[1].Value;
            if (!allowed.Contains(name))
                invalidNames.Add(name);
        }

        foreach (var name in invalidNames)
            reasons.Add($"{fieldName} uses unsupported placeholder '{{{{{name}}}}}'. Allowed: {(allowed.Count > 0 ? string.Join(", ", allowed) : "none")}.");
    }

    public static Result<(string Subject, string Body)> Render(
        string subjectTemplate,
        string bodyTemplate,
        bool isHtml,
        IReadOnlyDictionary<string, string> variables)
    {
        var renderedSubject = RenderText(subjectTemplate, variables, htmlEncode: false, out var missingSubjectVar);
        if (missingSubjectVar is not null)
            return ErrorType.EMAIL_TEMPLATE_VARIABLE_MISSING;

        var renderedBody = RenderText(bodyTemplate, variables, htmlEncode: isHtml, out var missingBodyVar);
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

    public static string BuildRecipientName(string? firstName, string? lastName = null)
    {
        var trimmedFirst = firstName?.Trim();
        if (!string.IsNullOrWhiteSpace(trimmedFirst))
            return trimmedFirst;

        return "Dalyvi";
    }
}