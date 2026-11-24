using System;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Memes.Results;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Models.Memes.Results;

namespace MidiMemeGame.Api.Services;

public class ResultPublicationService
{
    private readonly AppDbContext _db;
    private readonly EventPhaseService _eventPhase;
    private readonly MemeQueries _memeQueries;
    private readonly MemeNotificationService _notifications;
    private readonly ResultPublicationQueries _publicationQueries;
    private readonly ILogger<ResultPublicationService> _logger;

    public ResultPublicationService(
        AppDbContext db,
        EventPhaseService eventPhase,
        MemeQueries memeQueries,
        MemeNotificationService notifications,
        ResultPublicationQueries publicationQueries,
        ILogger<ResultPublicationService> logger)
    {
        _db = db;
        _eventPhase = eventPhase;
        _memeQueries = memeQueries;
        _notifications = notifications;
        _publicationQueries = publicationQueries;
        _logger = logger;
    }
    public async Task<Result<List<PublishedResultDto>>> GetPublicAsync(CancellationToken cancellationToken)
    {
        try
        {
            var publication = await _db.ResultPublications
                .AsNoTracking()
                .Where(x => x.EventScheduleId == EventSchedule.SingletonId)
                .Select(x => new
                {
                    Rows = x.Results
                        .OrderBy(r => r.Place)
                        .Select(r => new PublishedResultDto
                        {
                            Id = r.MemeId,
                            Place = r.Place,
                            SourcePhotoId = r.SourcePhotoId,
                            Caption = r.Caption,
                            UserName = r.UserName,
                            StatusId = r.StatusId,
                            Score = r.Score,
                            CreatedAtUtc = r.CreatedAtUtc,
                            UpdatedAtUtc = r.UpdatedAtUtc
                        })
                        .ToList()
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (publication is null)
                return ErrorType.RESULTS_NOT_PUBLISHED;

            return publication.Rows;
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);
            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }
    public async Task<Result> PublishAsync(
        int[]? podiumMemeIds,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var transaction =
                await _db.Database.BeginTransactionAsync(cancellationToken);

            int eventId = EventSchedule.SingletonId;

            var existing = await _db.ResultPublications
                .AsNoTracking()
                .Where(x => x.EventScheduleId == eventId)
                .Select(x => new
                {
                    PodiumIds = x.Results
                        .Where(r => r.Place <= 3)
                        .OrderBy(r => r.Place)
                        .Select(r => r.MemeId)
                        .ToList()
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (existing is not null)
            {
                if (podiumMemeIds is not null &&
                    existing.PodiumIds.SequenceEqual(podiumMemeIds))
                    return Result.Ok();

                return ErrorType.RESULTS_ALREADY_PUBLISHED;
            }

            var phase = await _eventPhase.EnsureEventEndedAsync(cancellationToken);
            if (phase.IsError)
                return phase;

            var candidates = await _memeQueries.GetResultCandidatesAsync(
                cancellationToken);

            if (candidates.IsError)
                return candidates.Error;

            var order = BuildFinalOrder(candidates.Value, podiumMemeIds);
            if (order.IsError)
                return order.Error;

            var publicationId = Guid.NewGuid();
            var publication = new ResultPublication
            {
                EventScheduleId = eventId,
                PublishedAtUtc = DateTime.UtcNow
            };

            for (int index = 0; index < order.Value.Count; index++)
            {
                var meme = order.Value[index];
                int place = index + 1;

                var row = new PublishedMemeResult
                {
                    EventScheduleId = eventId,
                    Place = place,
                    MemeId = meme.Id,
                    SourcePhotoId = meme.SourcePhotoId,
                    Caption = meme.Caption,
                    UserName = meme.UserName,
                    StatusId = meme.StatusId,
                    Score = meme.Score,
                    CreatedAtUtc = meme.CreatedAtUtc,
                    UpdatedAtUtc = meme.UpdatedAtUtc
                };

                if (place <= 3)
                {
                    var details = await _memeQueries.GetModerationDetailsAsync(
                        meme.Id, cancellationToken);
                    if (details.IsError)
                        return details.Error;
                        
                    var email = await _notifications.EnqueueWinnerAsync(
                        publicationId, meme.Id, details.Value, place, cancellationToken);

                    if (email.IsError)
                        return email.Error;

                    row.WinnerEmail = email.Value.RecipientAddress;
                    row.WinnerDeliveryId = email.Value.Id;
                }

                publication.Results.Add(row);
            }

            _db.ResultPublications.Add(publication);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result.Ok();
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);
            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }
    public async Task<Result<AdminResultsDto>> GetAdminResultsAsync(CancellationToken cancellationToken)
    {
        var phase = await _eventPhase.EnsureEventEndedAsync(
        cancellationToken);

        if (phase.IsError)
            return phase.Error;

        int eventId = EventSchedule.SingletonId;

        var publication = await _publicationQueries.GetPublishedAtAsync(
            eventId, cancellationToken);

        if (publication.IsError)
            return publication.Error;

        if (publication.TryGetResult(out var publishedAt))
        {
            var winners = await _publicationQueries.GetWinnersAsync(
                eventId, cancellationToken);

            if (winners.IsError)
                return winners.Error;

            return new AdminResultsDto
            {
                Published = true,
                PublishedAtUtc = publishedAt,
                Winners = winners.Value
            };
        }

        var candidates = await _memeQueries.GetResultCandidatesAsync(
            cancellationToken);

        if (candidates.IsError)
            return candidates.Error;

        return new AdminResultsDto
        {
            Published = false,
            Candidates = candidates.Value
        };
    }
    public async Task<Result> UnpublishAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var transaction =
                await _db.Database.BeginTransactionAsync(cancellationToken);

            int eventId = EventSchedule.SingletonId;

            await _db.PublishedMemeResults
                .Where(x => x.EventScheduleId == eventId)
                .ExecuteDeleteAsync(cancellationToken);

            await _db.ResultPublications
                .Where(x => x.EventScheduleId == eventId)
                .ExecuteDeleteAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return Result.Ok();
        }
        catch (SqliteException ex)
        {
            _logger.LogError(ex, LogMessages.DB_SQL_EXCEPTION, ex.Message);
            return ErrorType.DB_SQL_EXCEPTION;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogMessages.DB_EXCEPTION, ex.Message);
            return ErrorType.DB_EXCEPTION;
        }
    }
    private static Result<List<ResultCandidateDto>> BuildFinalOrder(
        List<ResultCandidateDto> candidates,
        int[]? podiumMemeIds)
    {
        int podiumSize = Math.Min(3, candidates.Count);

        if (podiumMemeIds is null || podiumMemeIds.Length != podiumSize)
            return ErrorType.BAD_REQUEST;

        var candidatesById = candidates.ToDictionary(x => x.Id);
        var selectedIds = new HashSet<int>();
        var finalOrder = new List<ResultCandidateDto>(candidates.Count);

        for (int index = 0; index < podiumSize; index++)
        {
            int memeId = podiumMemeIds[index];
            int place = index + 1;

            if (!candidatesById.TryGetValue(memeId, out var candidate))
                return ErrorType.BAD_REQUEST;

            if (!selectedIds.Add(memeId))
                return ErrorType.BAD_REQUEST;

            long requiredScore = candidates[index].Score;

            if (candidate.Score != requiredScore)
                return ErrorType.BAD_REQUEST;

            finalOrder.Add(candidate);
        }

        finalOrder.AddRange(candidates.Where(x => !selectedIds.Contains(x.Id)));
        return finalOrder;
    }
}
