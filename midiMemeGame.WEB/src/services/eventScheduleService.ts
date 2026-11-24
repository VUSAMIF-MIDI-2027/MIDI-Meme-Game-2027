import { apiBaseUrl } from "./apiBaseUrl";

export const eventScheduleFields = ["eventStartsAt", "votingStartsAt", "eventEndsAt"] as const;
export type EventScheduleField = (typeof eventScheduleFields)[number];
export type EventSchedule = Record<EventScheduleField, string>;

export class EventScheduleError extends Error {
    constructor(public status: number, public code?: number) {
        super(`Event schedule request failed: HTTP ${status}`);
    }
}

const scheduleUrl = apiBaseUrl + "/api/event-schedule";
const REQUEST_TIMEOUT_MS = 20_000;
let scheduleRequest: Promise<EventSchedule | null> | null = null;


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

export async function getEventSchedule(signal: AbortSignal): Promise<EventSchedule | null> {
    if (!scheduleRequest) {
        scheduleRequest = fetch(scheduleUrl, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            cache: "no-store",
        })
            .then(readSchedule)
            .catch((error: unknown) => {
                if (error instanceof EventScheduleError && error.status === 404 && error.code === 2400) {
                    return null;
                }
                throw error;
            })
            .finally(() => {
                scheduleRequest = null;
            });
    }

    const request = scheduleRequest;
    return new Promise((resolve, reject) => {
        let settled = false;

        function finish(callback: () => void) {
            if (settled) return;
            settled = true;
            signal.removeEventListener("abort", abort);
            callback();
        }

        function abort() {
            finish(() => reject(signal.reason));
        }

        signal.addEventListener("abort", abort, { once: true });
        if (signal.aborted) {
            abort();
            return;
        }

        request.then(
            schedule => finish(() => resolve(schedule)),
            error => finish(() => reject(error)),
        );
    });
}

export async function saveEventSchedule(
    schedule: EventSchedule,
    token: string,
    signal: AbortSignal,
): Promise<EventSchedule> {
    return readSchedule(await fetch(scheduleUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
        signal,
        cache: "no-store",
    }));
}
