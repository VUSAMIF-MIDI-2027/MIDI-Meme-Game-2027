using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261123193000_RefreshContestEmailCopy")]
public class RefreshContestEmailCopy : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
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
                AND "Subject" = 'Memų konkursas prasidėjo!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}! Jau galite kurti ir pateikti savo memus.', CHAR(13), '')
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Jau galite balsuoti už MIDI memus!',
                "Body" = 'Sveiki, {{recipientName}}!

            Balsavimas atidarytas. Peržiūrėkite konkurso memus ir išrinkite iki trijų favoritų. Kiekvieną balsą skirkite skirtingam memui.

            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'VotingOpened'
                AND "Subject" = 'Balsavimas prasidėjo!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}! Peržiūrėkite memų galeriją ir atiduokite iki trijų balsų patikusiems skirtingiems memams.', CHAR(13), '')
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'MIDI memų konkursas baigėsi',
                "Body" = 'Sveiki, {{recipientName}}!

            MIDI memų konkursas baigėsi. Ačiū visiems, kurie kūrė, balsavo ir dalijosi savo humoru.

            Iki kitų susitikimų!
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'EventEnded'
                AND "Subject" = 'Ačiū, kad dalyvavote!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}! Memų konkursas baigėsi. Ačiū, kad skyrėte laiko kurti, balsuoti ir dalyvauti.', CHAR(13), '')
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas – tarp MIDI konkurso laimėtojų!',
                "Body" = 'Sveiki, {{recipientName}}!

            Jūsų memas „{{memeTitle}}“ tapo vienu iš MIDI memų konkurso laimėtojų. Sveikiname!

            Ačiū, kad pasidalijote savo idėja.
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'WinnerNotification'
                AND "Subject" = 'Sveikiname! Jūsų memas laimėjo MIDI memų konkurse!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}! Sveikiname – Jūsų sukurtas memas „{{memeTitle}}“ tapo vienu iš MIDI memų konkurso nugalėtojų!', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Memų konkursas prasidėjo!',
                "Body" = 'Sveiki, {{recipientName}}! Jau galite kurti ir pateikti savo memus.',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'EventStarted'
                AND "Subject" = 'MIDI memų konkursas prasidėjo!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            MIDI memų konkursas atidarytas. Išsirinkite nuotrauką, sugalvokite jai tekstą ir pateikite savo memą.

            Iki pasimatymo konkurse!
            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Balsavimas prasidėjo!',
                "Body" = 'Sveiki, {{recipientName}}! Peržiūrėkite memų galeriją ir atiduokite iki trijų balsų patikusiems skirtingiems memams.',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'VotingOpened'
                AND "Subject" = 'Jau galite balsuoti už MIDI memus!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            Balsavimas atidarytas. Peržiūrėkite konkurso memus ir išrinkite iki trijų favoritų. Kiekvieną balsą skirkite skirtingam memui.

            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Ačiū, kad dalyvavote!',
                "Body" = 'Sveiki, {{recipientName}}! Memų konkursas baigėsi. Ačiū, kad skyrėte laiko kurti, balsuoti ir dalyvauti.',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'EventEnded'
                AND "Subject" = 'MIDI memų konkursas baigėsi'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            MIDI memų konkursas baigėsi. Ačiū visiems, kurie kūrė, balsavo ir dalijosi savo humoru.

            Iki kitų susitikimų!
            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Sveikiname! Jūsų memas laimėjo MIDI memų konkurse!',
                "Body" = 'Sveiki, {{recipientName}}! Sveikiname – Jūsų sukurtas memas „{{memeTitle}}“ tapo vienu iš MIDI memų konkurso nugalėtojų!',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'WinnerNotification'
                AND "Subject" = 'Jūsų memas – tarp MIDI konkurso laimėtojų!'
                AND REPLACE("Body", CHAR(13), '') = REPLACE('Sveiki, {{recipientName}}!

            Jūsų memas „{{memeTitle}}“ tapo vienu iš MIDI memų konkurso laimėtojų. Sveikiname!

            Ačiū, kad pasidalijote savo idėja.
            MIDI komanda', CHAR(13), '')
                AND "IsHtml" = 0;
            """);
    }
}
