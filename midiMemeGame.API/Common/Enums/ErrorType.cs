namespace MidiMemeGame.Api.Common.Enums;

public enum ErrorType
{
    NONE = 0,

    // 0xxx - Non critical errors
    NOT_FOUND = 4,
    INTERNAL_SERVER_ERROR = 5,
    BAD_REQUEST = 6,

    // 4xxx - Clerk errors
    CLERK_PAYLOAD_INVALID = 4001,
    CLERK_USER_DATA_INVALID = 4002,
    CLERK_API_UNAVAILABLE = 4003,
    USER_ACCESS_DENIED = 4004,
}
