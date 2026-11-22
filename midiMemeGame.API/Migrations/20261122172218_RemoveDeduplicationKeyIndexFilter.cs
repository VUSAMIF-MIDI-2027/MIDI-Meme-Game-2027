using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDeduplicationKeyIndexFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailDeliveries_DeduplicationKey",
                table: "EmailDeliveries");

            migrationBuilder.CreateIndex(
                name: "IX_EmailDeliveries_DeduplicationKey",
                table: "EmailDeliveries",
                column: "DeduplicationKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailDeliveries_DeduplicationKey",
                table: "EmailDeliveries");

            migrationBuilder.CreateIndex(
                name: "IX_EmailDeliveries_DeduplicationKey",
                table: "EmailDeliveries",
                column: "DeduplicationKey",
                unique: true,
                filter: "\"DeduplicationKey\" IS NOT NULL");
        }
    }
}
