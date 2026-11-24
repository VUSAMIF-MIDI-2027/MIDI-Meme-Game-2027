using System.Globalization;
using SkiaSharp;

namespace MidiMemeGame.Api.Services;

public static class MemePreviewRenderer
{
    public static byte[] Render(string imagePath, string caption)
    {
        const int cardWidth = 356;
        const int photoHeight = 237;
        const int minCaptionHeight = 80;
        const int horizontalPadding = 20;
        const int verticalPadding = 16;
        const int radius = 11;
        const int scale = 2;

        using var bitmap = SKBitmap.Decode(imagePath)
            ?? throw new InvalidDataException(
                "Nepavyko perskaityti memo nuotraukos.");

        using var photo = SKImage.FromBitmap(bitmap);

        var fontPath = Path.Combine(
            AppContext.BaseDirectory,
            "Assets",
            "Fonts",
            "Dosis-SemiBold.ttf");

        using var typeface = SKTypeface.FromFile(fontPath)
            ?? throw new InvalidDataException("Nepavyko įkelti memo šrifto.");

        using var font = new SKFont(typeface, 16);
        using var textPaint = new SKPaint
        {
            Color = SKColors.Black,
            IsAntialias = true
        };

        var lines = Wrap(caption, font, cardWidth - 2 * horizontalPadding);
        var metrics = font.Metrics;
        var fontHeight = metrics.Descent - metrics.Ascent;
        var lineHeight = MathF.Ceiling(fontHeight + 2);
        var textHeight = fontHeight + Math.Max(0, lines.Count - 1) * lineHeight;

        var captionHeight = Math.Max(
            minCaptionHeight,
            (int)MathF.Ceiling(textHeight) + 2 * verticalPadding);

        var cardHeight = photoHeight + captionHeight;

        using var output = new SKBitmap(cardWidth * scale, cardHeight * scale);
        using var canvas = new SKCanvas(output);

        canvas.Clear(SKColors.White);
        canvas.Scale(scale);

        var cardBounds = SKRect.Create(0, 0, cardWidth, cardHeight);
        using var outlineBuilder = new SKPathBuilder();
        outlineBuilder.AddRoundRect(cardBounds, radius, radius);
        using var outline = outlineBuilder.Detach();

        canvas.Save();
        canvas.ClipPath(outline, antialias: true);

        // Centrinis apkirpimas, atitinkantis CSS object-cover.
        var fit = Math.Max(
            (float)cardWidth / photo.Width,
            (float)photoHeight / photo.Height);

        var cropWidth = cardWidth / fit;
        var cropHeight = photoHeight / fit;
        var source = SKRect.Create(
            (photo.Width - cropWidth) / 2,
            (photo.Height - cropHeight) / 2,
            cropWidth,
            cropHeight);

        canvas.DrawImage(
            photo,
            source,
            SKRect.Create(0, 0, cardWidth, photoHeight),
            new SKSamplingOptions(SKFilterMode.Linear));

        var baseline =
            photoHeight + (captionHeight - textHeight) / 2 - metrics.Ascent;

        foreach (var line in lines)
        {
            canvas.DrawText(
                line, cardWidth / 2f, baseline, SKTextAlign.Center, font, textPaint);

            baseline += lineHeight;
        }

        canvas.Restore();

        const float borderWidth = 1f;
        const float inset = borderWidth / 2f;

        var borderBounds = new SKRect(
            inset,
            inset,
            cardWidth - inset,
            cardHeight - inset);

        using var borderPaint = new SKPaint
        {
            Color = SKColor.Parse("#B8BEC4"),
            Style = SKPaintStyle.Stroke,
            StrokeWidth = borderWidth,
            IsAntialias = true
        };

        canvas.DrawRoundRect(
            borderBounds,
            radius - inset,
            radius - inset,
            borderPaint);

        using var result = SKImage.FromBitmap(output);
        using var jpeg = result.Encode(SKEncodedImageFormat.Jpeg, 92)
            ?? throw new InvalidDataException("Nepavyko sukurti memo JPEG.");

        return jpeg.ToArray();
    }
    private static List<string> Wrap(string text, SKFont font, float maxWidth)
    {
        var lines = new List<string>();
        foreach (var paragraph in text.ReplaceLineEndings("\n").Split('\n'))
        {
            var line = "";
            foreach (var word in paragraph.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                var candidate = line.Length == 0 ? word : $"{line} {word}";
                if (font.MeasureText(candidate) <= maxWidth)
                {
                    line = candidate;
                    continue;
                }

                if (line.Length > 0)
                    lines.Add(line);

                // Ilgas žodis ar nuoroda irgi turi tilpti į paveikslėlį.
                line = "";
                var elements = StringInfo.GetTextElementEnumerator(word);
                while (elements.MoveNext())
                {
                    var element = elements.GetTextElement();
                    if (line.Length > 0 && font.MeasureText(line + element) > maxWidth)
                    {
                        lines.Add(line);
                        line = "";
                    }
                    line += element;
                }
            }
            lines.Add(line);
        }
        return lines;
    }
}