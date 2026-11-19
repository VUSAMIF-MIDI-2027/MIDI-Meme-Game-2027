using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using MidiMemeGame.Api.Common.Enums;
using MidiMemeGame.Api.Common.Models;
using MidiMemeGame.Api.Helpers;
using MidiMemeGame.Api.Models;
using MidiMemeGame.Api.Models.Settings;

namespace MidiMemeGame.Api.Services;

public class PhotoFileService
{
    private readonly string _root;
    private readonly PhotoUploadSettings _settings;
    private readonly ILogger<PhotoFileService> _logger;

    public PhotoFileService(
        IWebHostEnvironment environment,
        IOptions<FileStorageSettings> storage,
        IOptions<PhotoUploadSettings> uploadSettings,
        ILogger<PhotoFileService> logger)
    {
        var rootPath = storage.Value.RootPath;

        if (!Path.IsPathRooted(rootPath))
            rootPath = Path.Combine(environment.ContentRootPath, rootPath);

        _root = Path.GetFullPath(rootPath);
        Directory.CreateDirectory(_root);

        _settings = uploadSettings.Value;
        _logger = logger;
    }

    public async Task<Result<SavedPhotoFile>> SaveUploadAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length <= 0)
            return ErrorType.PHOTO_FILE_EMPTY;

        if (file.Length > _settings.MaxFileSizeBytes)
            return ErrorType.PHOTO_FILE_TOO_LARGE;

        string? destination = null;
        var fileCreated = false;

        try
        {
            var typeResult = await PhotoFileHelper.DetectTypeAsync(file, cancellationToken);

            if (typeResult.IsError)
                return typeResult.Error;

            var fileType = typeResult.Value;

            if (!_settings.AllowedContentTypes.Contains(fileType.ContentType, StringComparer.OrdinalIgnoreCase))
                return ErrorType.PHOTO_FILE_TYPE_INVALID;

            var fileId = Convert.ToHexString(RandomNumberGenerator.GetBytes(6)).ToLowerInvariant();
            var relativePath = $"{fileId}{fileType.Extension}";

            var destinationResult = ResolvePath(relativePath);

            if (destinationResult.IsError)
                return destinationResult.Error;

            destination = destinationResult.Value;

                await using (var uploadedFile = file.OpenReadStream())
                {
                    await using var savedFile = new FileStream(
                        destination,
                        FileMode.CreateNew,
                        FileAccess.Write,
                        FileShare.None);

                    fileCreated = true;

                    await uploadedFile.CopyToAsync(
                        savedFile,
                        cancellationToken);
                }

            return new SavedPhotoFile
            {
                FileId = fileId,
                RelativePath = relativePath,
                ContentType = fileType.ContentType,
                Extension = fileType.Extension
            };

        }
        catch (Exception ex)
        {
            if (fileCreated)
                DeleteIncompleteFile(destination!);

            _logger.LogError(ex, "Failed to save uploaded photo.");

            return ErrorType.PHOTO_FILE_SAVE_FAILED;
        }
    }
    public Result Delete(string relativePath)
    {
        try
        {
            var pathResult = ResolvePath(relativePath);

            if (pathResult.IsError)
                return pathResult.Error;

            File.Delete(pathResult.Value);

            return Result.Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete photo.");

            return ErrorType.PHOTO_FILE_DELETE_FAILED;
        }
    }
    public Result<string> ResolvePath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath) || Path.IsPathRooted(relativePath))
            return ErrorType.PHOTO_FILE_PATH_INVALID;

        var fullPath = Path.GetFullPath(Path.Combine(_root, relativePath));

        var rootPrefix = Path.TrimEndingDirectorySeparator(_root) + Path.DirectorySeparatorChar;

        var comparison = OperatingSystem.IsWindows()
            ? StringComparison.OrdinalIgnoreCase
            : StringComparison.Ordinal;

        if (!fullPath.StartsWith(rootPrefix, comparison))
            return ErrorType.PHOTO_FILE_PATH_INVALID;

        return fullPath;
    }

    private void DeleteIncompleteFile(string path)
    {
        try
        {
            File.Delete(path);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete incomplete photo: {Path}", path);
        }
    }
}
