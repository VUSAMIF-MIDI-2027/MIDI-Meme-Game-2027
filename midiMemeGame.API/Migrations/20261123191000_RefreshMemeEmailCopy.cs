using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MidiMemeGame.Api.Data;

namespace MidiMemeGame.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261123191000_RefreshMemeEmailCopy")]
public class RefreshMemeEmailCopy : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Gavome jūsų memą!',
                "Body" = 'Sveiki, {{recipientName}}!

            Ačiū, kad prisijungėte prie MIDI memų konkurso. Jūsų memas „{{memeTitle}}“ jau pas mus ir laukia peržiūros. Apie sprendimą pranešime el. paštu.

            Iki!
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeSubmitted'
                AND "Subject" = 'Jūsų memas pateiktas!'
                AND "Body" = 'Sveiki, {{recipientName}}! Gavome jūsų memą „{{memeTitle}}“. Jis laukia moderavimo.'
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas patvirtintas!',
                "Body" = 'Sveiki, {{recipientName}}!

            Gera žinia – patvirtinome jūsų memą „{{memeTitle}}“! Ačiū, kad pasidalijote savo idėja. Žemiau rasite savo memo peržiūrą.

            Iki!
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeApproved'
                AND "Subject" = 'Jūsų memas patvirtintas!'
                AND "Body" = 'Sveiki, {{recipientName}}! Jūsų pateiktas memas „{{memeTitle}}“ buvo patvirtintas ir jau matomas konkurso galerijoje.'
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Peržiūrėjome jūsų memą',
                "Body" = 'Sveiki, {{recipientName}}!

            Ačiū, kad atsiuntėte memą „{{memeTitle}}“. Peržiūrėjome jį ir šį kartą nusprendėme jo nepatvirtinti. Žemiau rasite pateiktą versiją.

            Ačiū, kad dalyvaujate!
            MIDI komanda',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeRejected'
                AND "Subject" = 'Jūsų memas atmestas'
                AND "Body" = 'Sveiki, {{recipientName}}! Peržiūrėjome jūsų memą „{{memeTitle}}“. Šį kartą jis buvo atmestas.'
                AND "IsHtml" = 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas pateiktas!',
                "Body" = 'Sveiki, {{recipientName}}! Gavome jūsų memą „{{memeTitle}}“. Jis laukia moderavimo.',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeSubmitted'
                AND "Subject" = 'Gavome jūsų memą!'
                AND "Body" = 'Sveiki, {{recipientName}}!

            Ačiū, kad prisijungėte prie MIDI memų konkurso. Jūsų memas „{{memeTitle}}“ jau pas mus ir laukia peržiūros. Apie sprendimą pranešime el. paštu.

            Iki!
            MIDI komanda'
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas patvirtintas!',
                "Body" = 'Sveiki, {{recipientName}}! Jūsų pateiktas memas „{{memeTitle}}“ buvo patvirtintas ir jau matomas konkurso galerijoje.',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeApproved'
                AND "Subject" = 'Jūsų memas patvirtintas!'
                AND "Body" = 'Sveiki, {{recipientName}}!

            Gera žinia – patvirtinome jūsų memą „{{memeTitle}}“! Ačiū, kad pasidalijote savo idėja. Žemiau rasite savo memo peržiūrą.

            Iki!
            MIDI komanda'
                AND "IsHtml" = 0;

            UPDATE "EmailTemplates"
            SET "Subject" = 'Jūsų memas atmestas',
                "Body" = 'Sveiki, {{recipientName}}! Peržiūrėjome jūsų memą „{{memeTitle}}“. Šį kartą jis buvo atmestas.',
                "UpdatedAtUtc" = CURRENT_TIMESTAMP
            WHERE "Key" = 'MemeRejected'
                AND "Subject" = 'Peržiūrėjome jūsų memą'
                AND "Body" = 'Sveiki, {{recipientName}}!

            Ačiū, kad atsiuntėte memą „{{memeTitle}}“. Peržiūrėjome jį ir šį kartą nusprendėme jo nepatvirtinti. Žemiau rasite pateiktą versiją.

            Ačiū, kad dalyvaujate!
            MIDI komanda'
                AND "IsHtml" = 0;
            """);
    }
}
