import { apiBaseUrl } from "./apiBaseUrl";

export const eventScheduleFields = ["eventStartsAt", "votingStartsAt", "eventEndsAt"] as const;
export type EventScheduleField = (typeof eventScheduleFields)[number];
export type EventSchedule = Record<EventScheduleField, string>;

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

export class EventScheduleError extends Error {
    constructor(public status: number, public code?: number) {
        super(`Event schedule request failed: HTTP ${status}`);
    }
}

const scheduleUrl = apiBaseUrl + "/api/event-schedule";

async function readSchedule(response: Response): Promise<EventSchedule> {
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new EventScheduleError(response.status, body?.error?.code);
    }

    const schedule = await response.json();
    if (!eventScheduleFields.every(field =>
        typeof schedule?.[field] === "string"
        && /(?:Z|[+-]\d{2}:\d{2})$/.test(schedule[field])
        && Number.isFinite(Date.parse(schedule[field]))
    )) {
        throw new Error("Invalid event schedule response.");
    }

    return schedule;
}

export async function getEventSchedule(signal: AbortSignal): Promise<EventSchedule | null>;
export async function getEventSchedule(token: string, signal?: AbortSignal): Promise<EventScheduleState>;
export async function getEventSchedule(
    signalOrToken: AbortSignal | string,
    optionalSignal?: AbortSignal,
): Promise<EventSchedule | EventScheduleState | null> {
    const signal = typeof signalOrToken === "string" ? optionalSignal : signalOrToken;
    try {
        const response = await fetch(scheduleUrl, {
            headers: typeof signalOrToken === "string"
                ? { Authorization: "Bearer " + signalOrToken }
                : undefined,
            signal,
            cache: "no-store",
        });
        const schedule = await readSchedule(response);
        if (typeof signalOrToken === "string") {
            return {
                eventStartsAt: schedule.eventStartsAt,
                votingStartsAt: schedule.votingStartsAt,
                votingEndsAt: schedule.eventEndsAt,
                eventEndsAt: schedule.eventEndsAt,
            };
        }
        return schedule;
    } catch (error) {
        if (typeof signalOrToken !== "string"
            && error instanceof EventScheduleError
            && error.status === 404
            && error.code === 2400) {
            return null;
        }
        throw error;
    }
}

export async function saveEventSchedule(
    schedule: EventSchedule,
    token: string,
    signal: AbortSignal,
): Promise<EventSchedule> {
    return readSchedule(await fetch(scheduleUrl, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(schedule),
        signal,
        cache: "no-store",
    }));
}

export async function updateEventSchedule(
    payload: UpdateEventSchedulePayload,
    token: string,
    signal?: AbortSignal,
): Promise<EventScheduleState> {
    const schedule: EventSchedule = {
        eventStartsAt: payload.eventStartsAt ?? "",
        votingStartsAt: payload.votingStartsAt ?? "",
        eventEndsAt: payload.votingEndsAt ?? payload.eventEndsAt ?? "",
    };
    const stored = await saveEventSchedule(schedule, token, signal ?? AbortSignal.timeout(20_000));
    return {
        eventStartsAt: stored.eventStartsAt,
        votingStartsAt: stored.votingStartsAt,
        votingEndsAt: stored.eventEndsAt,
        eventEndsAt: stored.eventEndsAt,
    };
}
