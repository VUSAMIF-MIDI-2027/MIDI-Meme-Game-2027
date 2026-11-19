using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MidiMemeGame.Api.Migrations;

public partial class AddSourcePhotoRelativePath : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "RelativeFilePath",
            table: "SourcePhotos",
            type: "TEXT",
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateTable(
            name: "Memes",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false).Annotation("Sqlite:Autoincrement", true),
                SourcePhotoId = table.Column<string>(type: "TEXT", nullable: false),
                UserId = table.Column<string>(type: "TEXT", nullable: false),
                Status = table.Column<int>(type: "INTEGER", nullable: false),
                Caption = table.Column<string>(type: "TEXT", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Memes", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_Memes_SourcePhotoId_Status_IsDeleted",
            table: "Memes",
            columns: new[] { "SourcePhotoId", "Status", "IsDeleted" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Memes");
        migrationBuilder.DropColumn(name: "RelativeFilePath", table: "SourcePhotos");
    }
}
