using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Data.Queries;

namespace MidiMemeGame.Api.Services;

public class AccountDeletionService(AppDbContext db, UserQueries users, MemeQueries memes)
{
    public async Task DeleteAsync(string clerkId, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await users.MarkAccountDeletedAsync(clerkId, cancellationToken);
        await memes.MarkAuthorMemesDeletedAsync(clerkId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }
}
