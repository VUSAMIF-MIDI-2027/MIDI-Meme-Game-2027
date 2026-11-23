using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261123194000_SimplifyEventStartedEmail")]
public class SimplifyEventStartedEmail : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Memų konkursas prasidėjo',
                "Body" = 'Sveiki, {{recipientName}}!

            Konkurso puslapyje rasite memų pateikimo terminą ir taisykles.

            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'EventStarted'
                AND "Subject" = 'MIDI memų konkursas prasidėjo!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            MIDI memų konkursas atidarytas. Išsirinkite nuotrauką, sugalvokite jai tekstą ir pateikite savo memą.

            Iki pasimatymo konkurse!
            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'MIDI memų konkursas prasidėjo!',
                "Body" = 'Sveiki, {{recipientName}}!

            MIDI memų konkursas atidarytas. Išsirinkite nuotrauką, sugalvokite jai tekstą ir pateikite savo memą.

            Iki pasimatymo konkurse!
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'EventStarted'
                AND "Subject" = 'Memų konkursas prasidėjo'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            Konkurso puslapyje rasite memų pateikimo terminą ir taisykles.

            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }
}
