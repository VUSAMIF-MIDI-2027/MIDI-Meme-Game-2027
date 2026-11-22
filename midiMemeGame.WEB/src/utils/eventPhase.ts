import type { Lang } from "@/context/LanguageContext";
import type { EventSchedule } from "@/services/eventScheduleService";

export type EventPhase = "upcoming" | "submissions" | "voting" | "ended";

export function getEventPhase(schedule: EventSchedule, now: number) {
    if (now < Date.parse(schedule.eventStartsAt)) {
        return { phase: "upcoming", dateTime: schedule.eventStartsAt } as const;
    }
    if (now < Date.parse(schedule.votingStartsAt)) {
        return { phase: "submissions", dateTime: schedule.votingStartsAt } as const;
    }
    if (now < Date.parse(schedule.eventEndsAt)) {
        return { phase: "voting", dateTime: schedule.eventEndsAt } as const;
    }
    return { phase: "ended", dateTime: schedule.eventEndsAt } as const;
}

export function getCountdownParts(remainingSeconds: number) {
    return {
        days: Math.floor(remainingSeconds / 86400),
        hours: Math.floor((remainingSeconds % 86400) / 3600),
        minutes: Math.floor((remainingSeconds % 3600) / 60),
        seconds: remainingSeconds % 60,
    };
}

const timeZone = "Europe/Vilnius";
const dates = {
    lt: new Intl.DateTimeFormat("lt-LT", { timeZone, dateStyle: "long" }),
    en: new Intl.DateTimeFormat("en-GB", { timeZone, dateStyle: "long" }),
};
const monthAndDay = {
    lt: new Intl.DateTimeFormat("lt-LT", { timeZone, month: "long", day: "numeric" }),
    en: new Intl.DateTimeFormat("en-GB", { timeZone, month: "long", day: "numeric" }),
};
const time = new Intl.DateTimeFormat("lt-LT", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

export function formatEventDateTime(
    dateTime: string,
    lang: Lang,
    dateFormat: "full" | "month-day" = "full",
): string {
    const instant = Date.parse(dateTime);
    const date = dateFormat === "month-day" ? monthAndDay[lang] : dates[lang];
    return `${date.format(instant)} · ${time.format(instant)}`;
}
