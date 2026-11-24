using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Data.Queries;
using MidiMemeGame.Api.Dto.Memes.Voting;
using MidiMemeGame.Api.Services;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/voting")]
    [ApiController]
    [Authorize]
    public class VotingController : ControllerBase
    {
        private readonly VoteQueries _voteQueries;
        private readonly UserQueries _userQueries;
        private readonly EventPhaseService _eventPhase;

        public VotingController(
            VoteQueries voteQueries,
            UserQueries userQueries,
            EventPhaseService eventPhase)
        {
            _voteQueries = voteQueries;
            _userQueries = userQueries;
            _eventPhase = eventPhase;
        }

        [HttpGet("memes")]
        public async Task<IActionResult> GetMemes(
            CancellationToken cancellationToken,
            [FromQuery] int afterId = 0,
            [FromQuery] int limit = 12,
            [FromQuery] bool onlyVoted = false)
        {
            if (afterId < 0 || limit is < 1 or > 48)
                return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

            var voter = await GetVoterAsync(cancellationToken);
            if (voter.IsError)
                return VoteError(voter.Error);

            var phase = await _eventPhase.EnsureVotingOpenAsync(cancellationToken);
            if (phase.IsError)
                return VoteError(phase.Error);

            var result = await _voteQueries.GetVotableMemesAsync(
                voter.Value, afterId, limit + 1, onlyVoted, cancellationToken);

            if (result.IsError)
                return VoteError(result.Error);

            var memes = result.Value;
            var hasMore = memes.Count > limit;
            return Ok(new
            {
                Items = memes.Take(limit),
                NextAfterId = hasMore ? (int?)memes[limit - 1].Id : null
            });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyVotes(CancellationToken cancellationToken)
        {
            var voter = await GetVoterAsync(cancellationToken);
            if (voter.IsError)
                return VoteError(voter.Error);

            var result = await _voteQueries.GetMyVotingStateAsync(
                voter.Value, cancellationToken);

            if (result.IsError)
                return VoteError(result.Error);

            return Ok(result.Value);
        }

        [HttpPut("memes/{memeId:int}/vote")]
        public async Task<IActionResult> SetVote(
            int memeId,
            [FromBody] SetVoteRequestDto request,
            CancellationToken cancellationToken)
        {
            if (memeId <= 0 || request.Voted is not bool voted)
                return BadRequest(ErrorResponse.Create(ErrorType.BAD_REQUEST));

            var voter = await GetVoterAsync(cancellationToken);
            if (voter.IsError)
                return VoteError(voter.Error);

            var result = voted
                ? await _voteQueries.CastVoteAsync(voter.Value, memeId, cancellationToken)
                : await _voteQueries.WithdrawVoteAsync(voter.Value, memeId, cancellationToken);

            if (voted && result.Error == ErrorType.MEME_ALREADY_VOTED)
                result = await _voteQueries.GetMyVotingStateAsync(voter.Value, cancellationToken);

            if (result.IsError)
                return VoteError(result.Error);

            return Ok(result.Value);
        }

        private async Task<Result<int>> GetVoterAsync(CancellationToken cancellationToken)
        {
            var clerkId = User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(clerkId))
                return ErrorType.USER_ACCESS_DENIED;

            var user = await _userQueries.GetActiveIdByClerkIdAsync(
                clerkId, cancellationToken);

            if (user.Error == ErrorType.NOT_FOUND)
                return ErrorType.USER_ACCESS_DENIED;

            return user;
        }

        private IActionResult VoteError(ErrorType error)
        {
            var response = ErrorResponse.Create(error);

            return error switch
            {
                ErrorType.USER_ACCESS_DENIED or ErrorType.CANNOT_VOTE_FOR_OWN_MEME =>
                    StatusCode(StatusCodes.Status403Forbidden, response),

                ErrorType.NOT_FOUND or ErrorType.EVENT_SCHEDULE_NOT_FOUND =>
                    NotFound(response),

                ErrorType.VOTING_NOT_OPEN or ErrorType.VOTING_CLOSED
                    or ErrorType.VOTE_LIMIT_REACHED or ErrorType.MEME_ALREADY_VOTED =>
                    Conflict(response),

                _ => StatusCode(StatusCodes.Status500InternalServerError, response)
            };
        }
    }
}
