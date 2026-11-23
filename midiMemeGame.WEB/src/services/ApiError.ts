export class ApiError extends Error {
    constructor(
        readonly status: number, // HTTP status code
        readonly code: number | null = null, // backend ErrorType, e.g. 4004
        readonly codeName: string | null = null // e.g. "USER_ACCESS_DENIED"
    ) {
        super(`Request failed: ${status}`);
    }

    /** e.g. "USER_ACCESS_DENIED (4004)", "HTTP 403" or "NETWORK_ERROR". */
    get display(): string {
        if (this.code !== null) return `${this.codeName ?? "ERROR"} (${this.code})`;
        return this.status ? `HTTP ${this.status}` : "NETWORK_ERROR";
    }

    static fromParts(status: number, body: unknown): ApiError {
        const err = (body as { error?: { code?: unknown; message?: unknown } } | null)?.error;
        return new ApiError(
            status,
            typeof err?.code === "number" ? err.code : null,
            typeof err?.message === "string" ? err.message : null
        );
    }

    static async fromResponse(response: Response): Promise<ApiError> {
        let body: unknown = null;
        try {
            const text = await response.text();
            if (text) body = JSON.parse(text);
        } catch {
            // empty or non-JSON body (bare 401/403): status only
        }
        return ApiError.fromParts(response.status, body);
    }

    static network = () => new ApiError(0);
    static unauthorized = () => new ApiError(401);
    static invalidResponse = () => new ApiError(502);
}

export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

export function isTimeoutError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "TimeoutError";
}

/** Return error code part. Null for aborts, so there is nothing to display. */
export function errorCode(error: unknown): string | null {
    if (isAbortError(error)) return null;
    if (error instanceof ApiError) return error.display;
    if (isTimeoutError(error)) return "TIMEOUT";
    return "UNKNOWN_ERROR";
}