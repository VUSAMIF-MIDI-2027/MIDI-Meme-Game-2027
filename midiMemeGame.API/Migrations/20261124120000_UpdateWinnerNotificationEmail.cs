using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261124120000_UpdateWinnerNotificationEmail")]
public class UpdateWinnerNotificationEmail : Migration
{
    private const string WinnerSubject = "Laimėjote „Naktis su MIDI“ konkurse! Jūsų vieta – {{place}}";
    private const string WinnerBody = """
        Sveiki, {{recipientName}}!

        Sveikiname! Jūsų memas laimėjo „Naktis su MIDI“ memų konkurse.
        Jūsų vieta – {{place}}.

        Ačiū, kad dalyvavote ir pasidalijote savo idėja! Žemiau rasite laimėjusį memą.

        MIDI komanda artimiausiu metu susisieks su Jumis dėl prizo atsiėmimo. Jei šiuo metu esate renginyje, kreipkitės į organizatorius ir prizą galėsite atsiimti vietoje.

        Iki pasimatymo,
        MIDI komanda
        """;

    private const string PreviousBody = """
        Sveiki, {{recipientName}}!

        Jūsų memas „{{memeTitle}}“ tapo vienu iš MIDI memų konkurso laimėtojų. Sveikiname!

        Ačiū, kad pasidalijote savo idėja.
        MIDI komanda
        """;

    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql($"""
            UPDATE "EmailTemplates"
            SET "Subject" = '{WinnerSubject}',
                "Body" = '{WinnerBody}',
                "IsHtml" = 0,
                "AllowedPlaceholdersJson" = '["recipientName","memeTitle","place"]',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'WinnerNotification';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql($"""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas – tarp MIDI konkurso laimėtojų!',
                "Body" = '{PreviousBody}',
                "AllowedPlaceholdersJson" = '["recipientName","memeTitle"]',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'WinnerNotification'
                AND "Subject" = '{WinnerSubject}'
                AND "Body" = '{WinnerBody}'
                AND "IsHtml" = 0;
            """);
    }
}
