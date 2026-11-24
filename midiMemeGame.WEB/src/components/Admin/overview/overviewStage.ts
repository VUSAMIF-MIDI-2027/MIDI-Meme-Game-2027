import type { EventSchedule } from "@/services/eventScheduleService";

export function resolveCurrentStage(
    schedule: EventSchedule | null,
    lang: "lt" | "en",
    nowMs = Date.now()
): string {
    if (!schedule) {
        return lang === "lt" ? "Tvarkaraštis nenustatytas" : "Schedule not set";
    }

    const startsAt = Date.parse(schedule.eventStartsAt);
    const votingAt = Date.parse(schedule.votingStartsAt);
    const endsAt = Date.parse(schedule.eventEndsAt);

    if (Number.isFinite(startsAt) && nowMs < startsAt) {
        return lang === "lt" ? "Laukiama pradžios" : "Not started";
    }
    if (Number.isFinite(votingAt) && nowMs < votingAt) {
        return lang === "lt" ? "Memų teikimas" : "Meme creation";
    }
    if (Number.isFinite(endsAt) && nowMs < endsAt) {
        return lang === "lt" ? "Memų balsavimas" : "Meme voting";
    }
    return lang === "lt" ? "Rezultatai" : "Results";
}