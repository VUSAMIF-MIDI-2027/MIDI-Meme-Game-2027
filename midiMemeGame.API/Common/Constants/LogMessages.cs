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

    public static class Clerk
    {
        public const string USER_NOT_FOUND = "Clerk user {ClerkId} was not found.";
        public const string USER_REQUEST_FAILED = "Clerk user request failed with status {StatusCode}.";
        public const string USER_DATA_INCOMPLETE = "Clerk returned incomplete user data for {ClerkId}.";
        public const string API_REQUEST_FAILED = "Clerk API request failed.";
        public const string API_TIMEOUT = "Clerk API request timed out.";
        public const string API_INVALID_JSON = "Clerk API returned invalid JSON.";
    }

    public static class Email
    {
        public const string QUEUED = "Email delivery {DeliveryId} queued for template {TemplateKey}.";
        public const string SENT = "Email delivery {DeliveryId} sent.";
        public const string SEND_RETRY = "Email delivery {DeliveryId} failed on attempt {Attempt}, next attempt at {NextAttemptAtUtc}.";
        public const string SEND_FAILED = "Email delivery {DeliveryId} failed permanently after {Attempt} attempts.";
        public const string SMTP_ERROR = "SMTP error while sending delivery {DeliveryId}.";
        public const string WORKER_ITERATION_FAILED = "Email delivery worker iteration failed.";
        public const string SCHEDULED_WORKER_ITERATION_FAILED = "Scheduled email worker iteration failed.";
        public const string SCHEDULED_MILESTONE_FAILED = "Failed to process scheduled email milestone {Milestone} for event {EventId}.";
    }

    public const string APPLICATION_START_FAILED = "Application failed to start";
    public const string STARTUP_EXCEPTION_PREFIX = "Exception message: ";
    public const string STARTUP_INNER_EXCEPTION_PREFIX = "Inner exception message:";
}
