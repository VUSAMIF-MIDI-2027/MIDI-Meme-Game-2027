using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261127120000_AddMemePublicationConsent")]
public sealed class AddMemePublicationConsent : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(name: "MemePublicationConsentedAtUtc", table: "Memes", type: "TEXT", nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "NamePublicationConsentedAtUtc", table: "Memes", type: "TEXT", nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "MemePublicationWithdrawnAtUtc", table: "Memes", type: "TEXT", nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "NamePublicationWithdrawnAtUtc", table: "Memes", type: "TEXT", nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "MemePublicationConsentedAtUtc", table: "Memes");
        migrationBuilder.DropColumn(name: "NamePublicationConsentedAtUtc", table: "Memes");
        migrationBuilder.DropColumn(name: "MemePublicationWithdrawnAtUtc", table: "Memes");
        migrationBuilder.DropColumn(name: "NamePublicationWithdrawnAtUtc", table: "Memes");
    }
}
