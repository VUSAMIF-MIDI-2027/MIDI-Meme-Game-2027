using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261123192000_ClarifyMemeRejectionEmail")]
public class ClarifyMemeRejectionEmail : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas atmestas',
                "Body" = 'Sveiki, {{recipientName}}.

            Jūsų memas „{{memeTitle}}“ atmestas. Jis nebus skelbiamas konkurso galerijoje.

            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeRejected'
                AND "Subject" = 'Peržiūrėjome jūsų memą'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            Ačiū, kad atsiuntėte memą „{{memeTitle}}“. Peržiūrėjome jį ir šį kartą nusprendėme jo nepatvirtinti. Žemiau rasite pateiktą versiją.

            Ačiū, kad dalyvaujate!
            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Peržiūrėjome jūsų memą',
                "Body" = 'Sveiki, {{recipientName}}!

            Ačiū, kad atsiuntėte memą „{{memeTitle}}“. Peržiūrėjome jį ir šį kartą nusprendėme jo nepatvirtinti. Žemiau rasite pateiktą versiją.

            Ačiū, kad dalyvaujate!
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeRejected'
                AND "Subject" = 'Jūsų memas atmestas'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}.

            Jūsų memas „{{memeTitle}}“ atmestas. Jis nebus skelbiamas konkurso galerijoje.

            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }
}
