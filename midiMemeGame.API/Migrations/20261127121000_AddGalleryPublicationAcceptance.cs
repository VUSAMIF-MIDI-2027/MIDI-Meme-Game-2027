using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261127121000_AddGalleryPublicationAcceptance")]
public sealed class AddGalleryPublicationAcceptance : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "GalleryPublicationAccepted",
            table: "Memes",
            type: "INTEGER",
            nullable: false,
            defaultValue: false);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "GalleryPublicationAccepted", table: "Memes");
    }
}
