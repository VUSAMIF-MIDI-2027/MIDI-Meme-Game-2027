using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Email;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Services.Interfaces;

namespace MidiMemeGame.Api.Controllers;

[ApiController]
[Route("api/admin")]
// [Authorize(Roles = "admin")]
public class AdminEmailController : ControllerBase
{
    private readonly EmailTemplateQueries _templateQueries;
    private readonly IEmailService _emailService;
    private readonly UserQueries _userQueries;

    public AdminEmailController(
        EmailTemplateQueries templateQueries,
        IEmailService emailService,
        UserQueries userQueries)
    {
        _templateQueries = templateQueries;
        _emailService = emailService;
        _userQueries = userQueries;
    }

    [HttpGet("email-templates")]
    public async Task<IActionResult> GetTemplates(CancellationToken cancellationToken)
    {
        var result = await _templateQueries.GetAllAsync(cancellationToken);

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(result.Value.Select(t => new EmailTemplateListItemResponse
        {
            Key = t.Key,
            Subject = t.Subject,
            UpdatedAtUtc = t.UpdatedAtUtc
        }));
    }

    [HttpGet("email-templates/{key}")]
    public async Task<IActionResult> GetTemplateByKey(
        string key,
        CancellationToken cancellationToken)
    {
        var result = await _templateQueries.GetByKeyAsync(key, cancellationToken);

        if (result.Error is ErrorType.NOT_FOUND or ErrorType.EMAIL_TEMPLATE_NOT_FOUND)
            return NotFound(ErrorResponse.Create(result.Error));

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(ToDetailResponse(result.Value));
    }

    [HttpPut("email-templates/{key}")]
    public async Task<IActionResult> UpdateTemplate(
        string key,
        [FromBody] RenderedEmailContent request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(ErrorResponse.Create(ErrorType.EMAIL_TEMPLATE_INVALID));

        var result = await _emailService.UpdateTemplateAsync(
            key,
            request.Subject,
            request.Body,
            cancellationToken);

        if (result.Error is ErrorType.NOT_FOUND or ErrorType.EMAIL_TEMPLATE_NOT_FOUND)
            return NotFound(ErrorResponse.Create(result.Error));

        if (result.Error == ErrorType.EMAIL_TEMPLATE_INVALID)
            return BadRequest(ErrorResponse.Create(result.Error));

        if (result.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(result.Error));

        return Ok(ToDetailResponse(result.Value));
    }

    [HttpPost("emails/send")]
    public async Task<IActionResult> SendManualEmail(
        [FromBody] SendManualEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (request.RecipientUserId is null or <= 0
            || string.IsNullOrWhiteSpace(request.Subject)
            || string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

        var emailResult = await _userQueries.GetActiveEmailByIdAsync(
            request.RecipientUserId.Value,
            cancellationToken);

        if (emailResult.Error == ErrorType.NOT_FOUND)
            return NotFound(ErrorResponse.Create(emailResult.Error));

        if (emailResult.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(emailResult.Error));

        if (string.IsNullOrWhiteSpace(emailResult.Value))
            return BadRequest(ErrorResponse.Create(ErrorType.EMAIL_RECIPIENT_MISSING));

        var enqueueResult = await _emailService.EnqueueRawAsync(
            emailResult.Value,
            request.Subject,
            request.Body,
            cancellationToken);

        if (enqueueResult.Error is ErrorType.EMAIL_RECIPIENT_MISSING
            or ErrorType.EMAIL_RECIPIENT_ADDRESS_INVALID
            or ErrorType.EMAIL_TEMPLATE_INVALID)
            return BadRequest(ErrorResponse.Create(enqueueResult.Error));

        if (enqueueResult.IsError)
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ErrorResponse.Create(enqueueResult.Error));

        return Accepted(new { deliveryId = enqueueResult.Value.Id });
    }

    private static EmailTemplateDetailResponse ToDetailResponse(EmailTemplate template)
    {
        var placeholders = EmailTemplateHelper.ParseAllowedPlaceholders(template.AllowedPlaceholdersJson);

        return new EmailTemplateDetailResponse
        {
            Key = template.Key,
            Subject = template.Subject,
            Body = template.Body,
            SupportedPlaceholders = [.. placeholders],
            UpdatedAtUtc = template.UpdatedAtUtc
        };
    }
}