using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Models.Settings;
using MidiMemeGame.Api.Services;
using Svix;
using Svix.Exceptions;

namespace MidiMemeGame.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/webhooks/clerk")]
public class ClerkWebhooksController(IOptions<ClerkSettings> settings, AccountDeletionService accounts) : ControllerBase
{
    [HttpPost]
    [RequestSizeLimit(1024 * 1024)]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        var secret = settings.Value.WebhookSigningSecret;
        if (string.IsNullOrWhiteSpace(secret))
            return StatusCode(StatusCodes.Status503ServiceUnavailable);

        using var reader = new StreamReader(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        var headers = new WebHeaderCollection();
        foreach (var name in new[] { "svix-id", "svix-timestamp", "svix-signature" })
        {
            if (!Request.Headers.TryGetValue(name, out var value) || value.Count != 1)
                return Unauthorized();
            headers[name] = value[0];
        }

        try
        {
            new Webhook(secret).Verify(payload, headers);
        }
        catch (WebhookVerificationException)
        {
            return Unauthorized();
        }

        try
        {
            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("type", out var type)
                || type.ValueKind != JsonValueKind.String)
                return BadRequest();

            if (type.GetString() != "user.deleted")
                return NoContent();

            if (!root.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Object
                || !data.TryGetProperty("id", out var id) || id.ValueKind != JsonValueKind.String
                || string.IsNullOrWhiteSpace(id.GetString()))
                return BadRequest();

            await accounts.DeleteAsync(id.GetString()!, cancellationToken);
            return NoContent();
        }
        catch (JsonException)
        {
            return BadRequest();
        }
    }
}
