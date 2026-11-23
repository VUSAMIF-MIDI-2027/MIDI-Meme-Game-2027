using System;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Common.Constants;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Dto.Memes.Voting;
using MidiMemeGame.Api.Enums;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public class VoteQueries
{
    private const int VoteLimit = 3;

    private readonly AppDbContext _db;
    private readonly ILogger<VoteQueries> _logger;

    public VoteQueries(AppDbContext db, ILogger<VoteQueries> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<List<VotableMemeDto>>> GetVotableMemesAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        try
        {
            FormattableString query = $"""
                SELECT
                    m."Id",
                    CAST(m."SourcePhotoId" AS INTEGER) AS "SourcePhotoId",
                    m."Caption",
                    m."CreatedAtUtc",
                    EXISTS (
                        SELECT 1
                        FROM "MemeVotes" AS v
                        WHERE v."UserId" = {userId}
                            AND v."MemeId" = m."Id"
                    ) AS "HasVoted"
                FROM "Memes" AS m
                INNER JOIN "SourcePhotos" AS p
                    ON p."Id" = CAST(m."SourcePhotoId" AS INTEGER)
                WHERE m."StatusId" = {(int)MemeStatus.Approved}
                    AND m."IsDeleted" = 0
                    AND m."IsInvalidatedBySourcePhoto" = 0
                    AND p."IsEnabled" = 1
                ORDER BY m."CreatedAtUtc" ASC, m."Id" ASC
                """;

            return await _db.Database.SqlQuery<VotableMemeDto>(query)
                .ToListAsync(cancellationToken);
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

    public async Task<Result<MyVotingStateDto>> GetMyVotingStateAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        try
        {
            return await ReadVotingStateAsync(userId, cancellationToken);
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

    public async Task<Result<MyVotingStateDto>> CastVoteAsync(
        int userId,
        int memeId,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var transaction =
                await _db.Database.BeginTransactionAsync(cancellationToken);

            var now = DateTime.UtcNow;

            FormattableString insert = $"""
                INSERT INTO "MemeVotes" ("UserId", "MemeId", "CreatedAtUtc")
                SELECT {userId}, m."Id", {now}
                FROM "Memes" AS m
                INNER JOIN "SourcePhotos" AS p
                    ON p."Id" = CAST(m."SourcePhotoId" AS INTEGER)
                WHERE m."Id" = {memeId}
                    AND m."StatusId" = {(int)MemeStatus.Approved}
                    AND m."IsDeleted" = 0
                    AND m."IsInvalidatedBySourcePhoto" = 0
                    AND p."IsEnabled" = 1
                    AND (
                        SELECT COUNT(*)
                        FROM "MemeVotes"
                        WHERE "UserId" = {userId}
                    ) < {VoteLimit}
                    AND EXISTS (
                        SELECT 1
                        FROM "EventSchedule" AS s
                        WHERE s."Id" = {EventSchedule.SingletonId}
                            AND julianday({now}) >= julianday(s."VotingStartsAt")
                            AND julianday({now}) < julianday(s."EventEndsAt")
                    )
                ON CONFLICT ("UserId", "MemeId") DO NOTHING
                """;

            var affected = await _db.Database.ExecuteSqlInterpolatedAsync(
                insert, cancellationToken);

            var state = await ReadVotingStateAsync(userId, cancellationToken);

            if (affected == 0)
            {
                var schedule = await _db.EventSchedules
                    .AsNoTracking()
                    .SingleOrDefaultAsync(
                        s => s.Id == EventSchedule.SingletonId,
                        cancellationToken);

                if (schedule is null)
                    return ErrorType.EVENT_SCHEDULE_NOT_FOUND;

                var instant = new DateTimeOffset(now);

                if (instant < schedule.VotingStartsAt)
                    return ErrorType.VOTING_NOT_OPEN;

                if (instant >= schedule.EventEndsAt)
                    return ErrorType.VOTING_CLOSED;

                if (state.VotedMemeIds.Contains(memeId))
                    return ErrorType.MEME_ALREADY_VOTED;

                if (state.RemainingVotes == 0)
                    return ErrorType.VOTE_LIMIT_REACHED;

                return ErrorType.NOT_FOUND;
            }

            FormattableString updateScore = $"""
                UPDATE "Memes"
                SET "Score" = "Score" + 1
                WHERE "Id" = {memeId}
                """;

            await _db.Database.ExecuteSqlInterpolatedAsync(
                updateScore, cancellationToken);

            await transaction.CommitAsync(cancellationToken);
            return state;
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

    private async Task<MyVotingStateDto> ReadVotingStateAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var votedMemeIds = await _db.MemeVotes
            .AsNoTracking()
            .Where(vote => vote.UserId == userId)
            .OrderBy(vote => vote.CreatedAtUtc)
            .ThenBy(vote => vote.MemeId)
            .Select(vote => vote.MemeId)
            .ToListAsync(cancellationToken);

        return new MyVotingStateDto
        {
            RemainingVotes = Math.Max(0, VoteLimit - votedMemeIds.Count),
            VotedMemeIds = votedMemeIds
        };
    }
    public async Task<Result<MyVotingStateDto>> WithdrawVoteAsync(
        int userId,
        int memeId,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var transaction =
                await _db.Database.BeginTransactionAsync(cancellationToken);

            var schedule = await _db.EventSchedules
                .AsNoTracking()
                .SingleOrDefaultAsync(
                    s => s.Id == EventSchedule.SingletonId,
                    cancellationToken);

            if (schedule is null)
                return ErrorType.EVENT_SCHEDULE_NOT_FOUND;

            var now = DateTimeOffset.UtcNow;

            if (now < schedule.VotingStartsAt)
                return ErrorType.VOTING_NOT_OPEN;

            if (now >= schedule.EventEndsAt)
                return ErrorType.VOTING_CLOSED;

            FormattableString deleteVote = $"""
            DELETE FROM "MemeVotes"
            WHERE "UserId" = {userId}
                AND "MemeId" = {memeId}
            """;

            var deleted = await _db.Database.ExecuteSqlInterpolatedAsync(
                deleteVote, cancellationToken);

            if (deleted > 0)
            {
                FormattableString updateScore = $"""
                UPDATE "Memes"
                SET "Score" = "Score" - 1
                WHERE "Id" = {memeId}
                """;

                await _db.Database.ExecuteSqlInterpolatedAsync(
                    updateScore, cancellationToken);
            }

            var state = await ReadVotingStateAsync(userId, cancellationToken);

            await transaction.CommitAsync(cancellationToken);
            return state;
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
}
