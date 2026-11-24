"use client";

import { type FormEvent, useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { settingsText } from "@/components/Admin/settings/settingsText";
import type { EventSchedule } from "@/services/eventScheduleService";
import { formatVilniusInput, parseVilniusInput } from "./eventScheduleTime";
import { DateTimeInput } from "./DateTimeInput";

function formatLithuanianDateTime(iso: string | null, fallback: string): string {
    if (!iso) return fallback;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return fallback;

    const datePart = new Intl.DateTimeFormat("lt-LT", {
        timeZone: "Europe/Vilnius",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("lt-LT", {
        timeZone: "Europe/Vilnius",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);

    return `${datePart} ${timePart}`;
}

type EventScheduleSectionProps = {
    schedule: EventSchedule | null;
    loading: boolean;
    saving: boolean;
    onSave: (schedule: EventSchedule) => Promise<void>;
    onInputEdit: () => void;
};

export function EventScheduleSection({
    schedule,
    loading,
    saving,
    onSave,
    onInputEdit,
}: EventScheduleSectionProps) {
    const { lang } = useLanguage();
    const t = settingsText[lang];

    const originalEventStart = formatVilniusInput(schedule?.eventStartsAt);
    const originalVotingStart = formatVilniusInput(schedule?.votingStartsAt);
    const originalVotingEnd = formatVilniusInput(schedule?.eventEndsAt);

    const [eventStartInput, setEventStartInput] = useState(originalEventStart);
    const [votingStartInput, setVotingStartInput] = useState(originalVotingStart);
    const [votingEndInput, setVotingEndInput] = useState(originalVotingEnd);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [previousSchedule, setPreviousSchedule] = useState(schedule);

    if (schedule !== previousSchedule) {
        setPreviousSchedule(schedule);
        if (schedule) {
            setEventStartInput(originalEventStart);
            setVotingStartInput(originalVotingStart);
            setVotingEndInput(originalVotingEnd);
        }
    }

    const isDirty =
        eventStartInput !== originalEventStart ||
        votingStartInput !== originalVotingStart ||
        votingEndInput !== originalVotingEnd;

    function resolveSchedule(requireAll = false): EventSchedule | null {
        const eventStartsAt =
            schedule && eventStartInput === originalEventStart
                ? schedule.eventStartsAt
                : parseVilniusInput(eventStartInput);

        const votingStartsAt =
            schedule && votingStartInput === originalVotingStart
                ? schedule.votingStartsAt
                : parseVilniusInput(votingStartInput);

        const eventEndsAt =
            schedule && votingEndInput === originalVotingEnd
                ? schedule.eventEndsAt
                : parseVilniusInput(votingEndInput);

        if (requireAll && (!eventStartsAt || !votingStartsAt || !eventEndsAt)) {
            setValidationError(t.invalidRangeError);
            return null;
        }

        if (eventStartsAt && votingStartsAt && Date.parse(votingStartsAt) <= Date.parse(eventStartsAt)) {
            setValidationError(t.invalidRangeError);
            return null;
        }

        if (votingStartsAt && eventEndsAt && Date.parse(eventEndsAt) <= Date.parse(votingStartsAt)) {
            setValidationError(t.invalidRangeError);
            return null;
        }

        setValidationError(null);

        if (!eventStartsAt || !votingStartsAt || !eventEndsAt) {
            return null;
        }

        return {
            eventStartsAt,
            votingStartsAt,
            eventEndsAt,
        };
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (saving || !isDirty) return;

        const resolved = resolveSchedule(true);
        if (!resolved) return;

        await onSave(resolved);
    }

    return (
        <section className="rounded-xl border border-white/15 bg-[#0d1013] p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
                <Clock className="size-5 text-midi-blue" aria-hidden="true" />
                <h2 className="text-xl font-bold text-white">{t.scheduleTitle}</h2>
            </div>
            <p className="mt-1.5 text-sm text-white/60">{t.scheduleDescription}</p>

            {loading && !schedule ? (
                <p className="mt-5 text-sm text-white/55">{t.loading}</p>
            ) : (
                <form onSubmit={handleSubmit} aria-busy={saving} className="mt-5 space-y-5">
                    <DateTimeInput
                        id="event-start"
                        label={t.eventStart}
                        value={eventStartInput}
                        dateAriaLabel={t.dateAriaLabel(t.eventStart)}
                        timeAriaLabel={t.timeAriaLabel(t.eventStart)}
                        onChange={(val) => {
                            setEventStartInput(val);
                            onInputEdit();
                            if (validationError) setValidationError(null);
                        }}
                        onBlur={() => resolveSchedule(false)}
                    />

                    <DateTimeInput
                        id="voting-start"
                        label={t.votingStart}
                        value={votingStartInput}
                        dateAriaLabel={t.dateAriaLabel(t.votingStart)}
                        timeAriaLabel={t.timeAriaLabel(t.votingStart)}
                        onChange={(val) => {
                            setVotingStartInput(val);
                            onInputEdit();
                            if (validationError) setValidationError(null);
                        }}
                        onBlur={() => resolveSchedule(false)}
                    />

                    <DateTimeInput
                        id="voting-end-results"
                        label={t.votingEndAndResults}
                        value={votingEndInput}
                        dateAriaLabel={t.dateAriaLabel(t.votingEndAndResults)}
                        timeAriaLabel={t.timeAriaLabel(t.votingEndAndResults)}
                        onChange={(val) => {
                            setVotingEndInput(val);
                            onInputEdit();
                            if (validationError) setValidationError(null);
                        }}
                        onBlur={() => resolveSchedule(false)}
                    />

                    {validationError && (
                        <p role="alert" className="text-sm font-medium text-rose-400">
                            {validationError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            !isDirty ||
                            !eventStartInput ||
                            !votingStartInput ||
                            !votingEndInput
                        }
                        className="min-h-11 w-full cursor-pointer rounded-lg bg-midi-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue sm:w-auto"
                    >
                        {saving ? t.savingSchedule : t.saveSchedule}
                    </button>
                </form>
            )}

            {schedule && (
                <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                        {t.currentScheduleLabel}
                    </p>
                    <dl className="mt-2.5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-white/10 bg-[#0b0f12] px-3.5 py-2.5">
                            <dt className="text-xs text-white/55">{t.eventStart}</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-white">
                                {formatLithuanianDateTime(schedule.eventStartsAt, t.notSet)}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-[#0b0f12] px-3.5 py-2.5">
                            <dt className="text-xs text-white/55">{t.votingStart}</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-white">
                                {formatLithuanianDateTime(schedule.votingStartsAt, t.notSet)}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-[#0b0f12] px-3.5 py-2.5">
                            <dt className="text-xs text-white/55">{t.votingEndAndResults}</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-white">
                                {formatLithuanianDateTime(schedule.eventEndsAt, t.notSet)}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </section>
    );
}