using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261123194500_SimplifyVotingOpenedEmail")]
public class SimplifyVotingOpenedEmail : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Balsavimas prasidėjo',
                "Body" = 'Sveiki, {{recipientName}}!

            Galite balsuoti už tris skirtingus memus.

            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'VotingOpened'
                AND "Subject" = 'Jau galite balsuoti už MIDI memus!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            Balsavimas atidarytas. Peržiūrėkite konkurso memus ir išrinkite iki trijų favoritų. Kiekvieną balsą skirkite skirtingam memui.

            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Jau galite balsuoti už MIDI memus!',
                "Body" = 'Sveiki, {{recipientName}}!

            Balsavimas atidarytas. Peržiūrėkite konkurso memus ir išrinkite iki trijų favoritų. Kiekvieną balsą skirkite skirtingam memui.

            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'VotingOpened'
                AND "Subject" = 'Balsavimas prasidėjo'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            Galite balsuoti už tris skirtingus memus.

            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }
}
