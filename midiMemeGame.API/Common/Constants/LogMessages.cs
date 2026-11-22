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

    public const string APPLICATION_START_FAILED = "Application failed to start";
    public const string STARTUP_EXCEPTION_PREFIX = "Exception message: ";
    public const string STARTUP_INNER_EXCEPTION_PREFIX = "Inner exception message:";

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
        public const string SCHEDULED_MILESTONE_FAILED = "Failed to process scheduled email milestone {Milestone} for event {EventId}({Error}).";
        public const string MARK_FAILED_ERROR = "Failed to mark email delivery {DeliveryId} as Failed ({Error}).";
        public const string RELEASE_FAILED_ERROR = "Failed to release {Count} email deliveries after SMTP error ({Error}).";
        public const string RELEASED_WITHOUT_ATTEMPT = "Released {Count} email deliveries without consuming attempts until {NextAttemptAtUtc:O}. Reason: {Reason}";
        public const string MARK_SENT_FAILED_ERROR = "Email delivery {DeliveryId} was sent via SMTP, but failed to update status to Sent ({Error}). Duplicate send possible after lease expiry.";
        public const string QUOTA_EXCEEDED_PAUSED = "SMTP quota exceeded on delivery {DeliveryId}; paused {Count} remaining deliveries without consuming attempts until {NextAttemptAtUtc:O}.";
        public const string SCHEDULE_RETRY_FAILED_ERROR = "Failed to schedule retry for email delivery {DeliveryId} ({Error}).";
        public const string SCHEDULED_MILESTONE_SKIPPED = "Skipping stale milestone {MilestoneKey} for event {EventId} (scheduled at {ScheduledAtUtc} UTC).";
        public const string WORKER_STARTING = "{WorkerName} is starting.";
        public const string WORKER_STOPPING = "{WorkerName} is stopping.";
        public const string RELEASE_STALE_FAILED_ERROR = "Failed to release stale email deliveries ({Error}).";
        public const string SCHEDULED_RECIPIENT_SKIPPED = "Skipping recipient {UserId} for milestone {MilestoneKey} in event {EventId} ({Error}).";
        public const string CLAIM_BATCH_FAILED_ERROR = "Failed to claim pending email deliveries ({Error}).";
    }
    public static class EventSchedule
    {
        public const string MEME_SUBMISSIONS_NOT_OPEN = "Meme submission rejected at {AttemptedAtUtc}. Submissions open at {EventStartsAtUtc}.";
        public const string MEME_SUBMISSIONS_CLOSED = "Meme submission rejected at {AttemptedAtUtc}. Submissions closed at {VotingStartsAtUtc}.";
    }
    public static class Memes
    {
        public const string USER_ACCESS_DENIED = "Meme save rejected. No active user found for Clerk ID {ClerkId}.";
        public const string SOURCE_PHOTO_NOT_FOUND = "Meme save rejected for user {UserId}. Source photo {SourcePhotoId} was not found.";
        public const string SOURCE_PHOTO_DISABLED = "Meme save rejected for user {UserId}. Source photo {SourcePhotoId} is disabled.";
        public const string UPDATE_TARGET_NOT_FOUND = "Meme update rejected. No editable meme {MemeId} found for user {UserId}.";
        public const string SUBMISSION_LIMIT_REACHED = "Meme submission rejected. User {UserId} has reached the submission limit.";
        public const string DELETE_TARGET_NOT_FOUND = "Meme delete rejected. No active meme {MemeId} found for user {UserId}.";
    }
}
