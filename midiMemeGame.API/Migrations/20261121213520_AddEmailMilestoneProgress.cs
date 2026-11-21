using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailMilestoneProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClaimedAtUtc",
                table: "EmailDeliveries",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmailMilestoneProgress",
                columns: table => new
                {
                    EventId = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Milestone = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    QueuedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailMilestoneProgress", x => new { x.EventId, x.Milestone });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailMilestoneProgress");

            migrationBuilder.DropColumn(
                name: "ClaimedAtUtc",
                table: "EmailDeliveries");
        }
    }
}
