using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMemeModerationEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO "EmailTemplates"
                    ("Key", "Subject", "Body", "IsHtml",
                    "AllowedPlaceholdersJson", "UpdatedAtUtc")
                VALUES (
                    'MemeRejected',
                    'Jūsų memas atmestas',
                    'Sveiki, {{recipientName}}! Peržiūrėjome jūsų memą „{{memeTitle}}“. Šį kartą jis buvo atmestas.',
                    0,
                    '["recipientName","memeTitle"]',
                    CURRENT_TIMESTAMP
                );

                CREATE TABLE "EmailDeliveryAttachments" (
                    "DeliveryId" INTEGER NOT NULL PRIMARY KEY,
                    "FileName" TEXT NOT NULL,
                    "Content" BLOB NOT NULL,
                    FOREIGN KEY ("DeliveryId") REFERENCES "EmailDeliveries" ("Id")
                        ON DELETE CASCADE
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TABLE "EmailDeliveryAttachments";
                DELETE FROM "EmailTemplates" WHERE "Key" = 'MemeRejected';
                """);
        }
    }
}
