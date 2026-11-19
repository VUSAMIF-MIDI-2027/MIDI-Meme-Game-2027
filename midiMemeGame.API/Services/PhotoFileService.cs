using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Models.Settings;

namespace MidiMemeGame.Api.Services;

public sealed class PhotoFileService
{
    private readonly string _root;
    private readonly PhotoUploadSettings _upload;

    public PhotoFileService(IWebHostEnvironment environment, IOptions<FileStorageSettings> storage, IOptions<PhotoUploadSettings> upload)
    {
        _root = Path.GetFullPath(Path.IsPathRooted(storage.Value.RootPath)
            ? storage.Value.RootPath
            : Path.Combine(environment.ContentRootPath, storage.Value.RootPath));
        _upload = upload.Value;
    }

    public long MaxFileSizeBytes => _upload.MaxFileSizeBytes;

    public async Task<(string RelativePath, string ContentType, string Extension)?> SaveUploadAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length <= 0 || file.Length > _upload.MaxFileSizeBytes) return null;

        var (contentType, extension) = await DetectTypeAsync(file, cancellationToken);
        if (contentType is null || !_upload.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase)) return null;

        Directory.CreateDirectory(_root);
        var relativePath = $"{Guid.NewGuid():N}{extension}";
        var destination = ResolvePath(relativePath);
        try
        {
            await using var source = file.OpenReadStream();
            await using var target = new FileStream(destination, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await source.CopyToAsync(target, cancellationToken);
            return (relativePath, contentType, extension);
        }
        catch
        {
            if (File.Exists(destination)) File.Delete(destination);
            throw;
        }
    }

    public string ResolvePath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath) || Path.IsPathRooted(relativePath))
            throw new InvalidDataException("Invalid stored photo path.");
        var fullPath = Path.GetFullPath(Path.Combine(_root, relativePath));
        var rootPrefix = _root.EndsWith(Path.DirectorySeparatorChar) ? _root : _root + Path.DirectorySeparatorChar;
        if (!fullPath.StartsWith(rootPrefix, StringComparison.Ordinal))
            throw new InvalidDataException("Stored photo path is outside the storage directory.");
        return fullPath;
    }

    public void Delete(string relativePath)
    {
        var path = ResolvePath(relativePath);
        if (File.Exists(path)) File.Delete(path);
    }

    private static async Task<(string? ContentType, string Extension)> DetectTypeAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var header = new byte[12];
        await using var stream = file.OpenReadStream();
        var read = await stream.ReadAsync(header.AsMemory(), cancellationToken);
        if (read >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return ("image/jpeg", ".jpg");
        if (read >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return ("image/png", ".png");
        if (read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') return ("image/webp", ".webp");
        return (null, string.Empty);
    }
}
