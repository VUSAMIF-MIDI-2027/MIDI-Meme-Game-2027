using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Data.Queries;

public static class UserQueries
{
    public static Task<int> UpsertFromClerkAsync(
        AppDbContext db,
        User user,
        CancellationToken cancellationToken
    )
    {
        FormattableString query =
            $"""
            INSERT INTO "Users"
            (
                "ClerkId",
                "Email",
                "FirstName",
                "LastName",
                "CreatedAtUtc",
                "LastClerkUpdatedAt",
                "IsDeleted"
            )
            VALUES
            (
                {user.ClerkId},
                {user.Email},
                {user.FirstName},
                {user.LastName},
                {user.CreatedAtUtc},
                {user.LastClerkUpdatedAt},
                0
            )
            ON CONFLICT ("ClerkId") DO
                UPDATE SET
                    "Email" = {user.Email},
                    "FirstName" = {user.FirstName},
                    "LastName" = {user.LastName},
                    "LastClerkUpdatedAt" = {user.LastClerkUpdatedAt}
                WHERE
                    "Users"."IsDeleted" = 0
                    AND "Users"."LastClerkUpdatedAt" < {user.LastClerkUpdatedAt};
            """;

        return db.Database.ExecuteSqlInterpolatedAsync(
            query,
            cancellationToken
        );
    }
    public static Task<int> MarkDeletedFromClerkAsync(
        AppDbContext db,
        string clerkId,
        CancellationToken cancellationToken)
    {
        FormattableString query = $"""
            UPDATE "Users"
            SET
                "IsDeleted" = 1
            WHERE
                "ClerkId" = {clerkId};
            """;

        return db.Database.ExecuteSqlInterpolatedAsync(
            query,
            cancellationToken
        );
    }

    public static Task<int?> GetActiveIdByClerkIdAsync(
        AppDbContext db,
        string clerkId,
        CancellationToken cancellationToken)
    {
        return db.Users
            .Where(user => user.ClerkId == clerkId && !user.IsDeleted)
            .Select(user => (int?)user.Id)
            .SingleOrDefaultAsync(cancellationToken);
    }
}
