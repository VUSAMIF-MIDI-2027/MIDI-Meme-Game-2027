using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailTemplatesAndDeliveries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailDeliveries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TemplateKey = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    RecipientAddress = table.Column<string>(type: "TEXT", maxLength: 320, nullable: false),
                    Subject = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    AttemptCount = table.Column<int>(type: "INTEGER", nullable: false),
                    NextAttemptAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastError = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    DeduplicationKey = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SentAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailDeliveries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                columns: table => new
                {
                    Key = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Subject = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "TEXT", nullable: false),
                    AllowedPlaceholdersJson = table.Column<string>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplates", x => x.Key);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailDeliveries_DeduplicationKey",
                table: "EmailDeliveries",
                column: "DeduplicationKey",
                unique: true,
                filter: "\"DeduplicationKey\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EmailDeliveries_Status_NextAttemptAtUtc",
                table: "EmailDeliveries",
                columns: new[] { "Status", "NextAttemptAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailDeliveries");

            migrationBuilder.DropTable(
                name: "EmailTemplates");
        }
    }
}
