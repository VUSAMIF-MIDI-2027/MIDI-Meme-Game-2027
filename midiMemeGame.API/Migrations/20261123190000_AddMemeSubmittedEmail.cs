using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261123190000_AddMemeSubmittedEmail")]
public class AddMemeSubmittedEmail : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            INSERT INTO "EmailTemplates"
                ("Key", "Subject", "Body", "IsHtml", "AllowedPlaceholdersJson", "UpdatedAtUtc")
            VALUES (
                'MemeSubmitted',
                'Jūsų memas pateiktas!',
                'Sveiki, {{recipientName}}! Gavome jūsų memą „{{memeTitle}}“. Jis laukia moderavimo.',
                0,
                '["recipientName","memeTitle"]',
                CURRENT_TIMESTAMP
            );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DELETE FROM "EmailTemplates" WHERE "Key" = 'MemeSubmitted';
            """);
    }
}
