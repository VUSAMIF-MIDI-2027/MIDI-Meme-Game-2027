namespace MidiMemeGame.Api.Common.Enums;

public enum ErrorType
{
    NONE = 0,

    // 0xxx - Non critical errors
    NOT_FOUND = 4,
    INTERNAL_SERVER_ERROR = 5,
    BAD_REQUEST = 6,
}
