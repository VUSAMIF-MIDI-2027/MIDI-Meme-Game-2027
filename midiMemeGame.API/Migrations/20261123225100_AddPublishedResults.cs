using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPublishedResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResultPublications",
                columns: table => new
                {
                    EventScheduleId = table.Column<int>(type: "INTEGER", nullable: false),
                    PublishedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultPublications", x => x.EventScheduleId);
                    table.ForeignKey(
                        name: "FK_ResultPublications_EventSchedule_EventScheduleId",
                        column: x => x.EventScheduleId,
                        principalTable: "EventSchedule",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PublishedMemeResults",
                columns: table => new
                {
                    EventScheduleId = table.Column<int>(type: "INTEGER", nullable: false),
                    Place = table.Column<int>(type: "INTEGER", nullable: false),
                    MemeId = table.Column<int>(type: "INTEGER", nullable: false),
                    SourcePhotoId = table.Column<int>(type: "INTEGER", nullable: false),
                    Caption = table.Column<string>(type: "TEXT", nullable: false),
                    UserName = table.Column<string>(type: "TEXT", nullable: true),
                    StatusId = table.Column<int>(type: "INTEGER", nullable: false),
                    Score = table.Column<long>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    WinnerEmail = table.Column<string>(type: "TEXT", nullable: true),
                    WinnerDeliveryId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublishedMemeResults", x => new { x.EventScheduleId, x.Place });
                    table.ForeignKey(
                        name: "FK_PublishedMemeResults_ResultPublications_EventScheduleId",
                        column: x => x.EventScheduleId,
                        principalTable: "ResultPublications",
                        principalColumn: "EventScheduleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PublishedMemeResults_EventScheduleId_MemeId",
                table: "PublishedMemeResults",
                columns: new[] { "EventScheduleId", "MemeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PublishedMemeResults");

            migrationBuilder.DropTable(
                name: "ResultPublications");
        }
    }
}
