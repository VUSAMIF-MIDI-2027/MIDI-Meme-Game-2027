using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameMemeStatusToStatusId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Memes",
                newName: "StatusId");

            migrationBuilder.RenameIndex(
                name: "IX_Memes_SourcePhotoId_Status_IsDeleted",
                table: "Memes",
                newName: "IX_Memes_SourcePhotoId_StatusId_IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StatusId",
                table: "Memes",
                newName: "Status");

            migrationBuilder.RenameIndex(
                name: "IX_Memes_SourcePhotoId_StatusId_IsDeleted",
                table: "Memes",
                newName: "IX_Memes_SourcePhotoId_Status_IsDeleted");
        }
    }
}
