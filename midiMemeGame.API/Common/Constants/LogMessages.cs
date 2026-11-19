namespace MidiMemeGame.Api.Common.Constants;

public static class LogMessages
{
    public const string CAUGHT_EXCEPTION = "Caught exception: \"{message}\"";
    public const string REQUEST_CANCELED = "Request was canceled";
    public const string DB_SQL_EXCEPTION = "Caught SQL exception: \"{message}\"";
    public const string DB_EXCEPTION = "Caught exception: \"{message}\"";

    public const string PHOTO_SAVE_FAILED = "Failed to save uploaded photo.";
    public const string PHOTO_DELETE_FAILED = "Failed to delete photo.";
    public const string PHOTO_INCOMPLETE_DELETE_FAILED = "Failed to delete incomplete photo: {Path}";

    public const string CLERK_USER_NOT_FOUND = "Clerk user {ClerkId} was not found.";
    public const string CLERK_USER_REQUEST_FAILED = "Clerk user request failed with status {StatusCode}.";
    public const string CLERK_USER_DATA_INCOMPLETE = "Clerk returned incomplete user data for {ClerkId}.";
    public const string CLERK_API_REQUEST_FAILED = "Clerk API request failed.";
    public const string CLERK_API_TIMEOUT = "Clerk API request timed out.";
    public const string CLERK_API_INVALID_JSON = "Clerk API returned invalid JSON.";

    public const string APPLICATION_START_FAILED = "Application failed to start";
    public const string STARTUP_EXCEPTION_PREFIX = "Exception message: ";
    public const string STARTUP_INNER_EXCEPTION_PREFIX = "Inner exception message:";
}
