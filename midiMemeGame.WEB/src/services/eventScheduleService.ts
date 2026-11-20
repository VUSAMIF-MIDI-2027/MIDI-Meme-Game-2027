const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL
    ?? (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "")
).replace(/[/]$/, "");

export interface EventScheduleState {
    eventStartsAt: string | null;
    votingStartsAt: string | null;
    votingEndsAt: string | null;
    eventEndsAt: string | null;
}

export interface UpdateEventSchedulePayload {
    eventStartsAt?: string | null;
    votingStartsAt?: string | null;
    votingEndsAt?: string | null;
    eventEndsAt?: string | null;
}

export class SettingsApiError extends Error {
    constructor(
        public readonly action: string,
        public readonly status: number,
        message?: string
    ) {
        super(message ?? `Settings request failed (${action}): ${status}`);
        this.name = "SettingsApiError";
    }
}

function normalizeScheduleResponse(raw: unknown): EventScheduleState {
    const data = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const endValue =
        typeof data.votingEndsAt === "string"
            ? data.votingEndsAt
            : typeof data.eventEndsAt === "string"
              ? data.eventEndsAt
              : null;

    return {
        eventStartsAt: typeof data.eventStartsAt === "string" ? data.eventStartsAt : null,
        votingStartsAt: typeof data.votingStartsAt === "string" ? data.votingStartsAt : null,
        votingEndsAt: endValue,
        eventEndsAt: endValue,
    };
}

export async function getEventSchedule(
    token: string,
    signal?: AbortSignal
): Promise<EventScheduleState> {
    const response = await fetch(`${apiBaseUrl}/api/event-schedule`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });

    if (!response.ok) {
        throw new SettingsApiError("fetch schedule", response.status);
    }

    const body: unknown = await response.json();
    return normalizeScheduleResponse(body);
}

export async function updateEventSchedule(
    payload: UpdateEventSchedulePayload,
    token: string,
    signal?: AbortSignal
): Promise<EventScheduleState> {
    const endIso = payload.votingEndsAt !== undefined ? payload.votingEndsAt : payload.eventEndsAt;
    const requestBody = {
        eventStartsAt: payload.eventStartsAt ?? null,
        votingStartsAt: payload.votingStartsAt ?? null,
        votingEndsAt: endIso ?? null,
        eventEndsAt: endIso ?? null,
    };

    const response = await fetch(`${apiBaseUrl}/api/event-schedule`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify(requestBody),
        signal,
        cache: "no-store",
    });

    if (!response.ok) {
        throw new SettingsApiError("save schedule", response.status);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const body: unknown = await response.json();
        return normalizeScheduleResponse(body);
    }

    return getEventSchedule(token, signal);
}