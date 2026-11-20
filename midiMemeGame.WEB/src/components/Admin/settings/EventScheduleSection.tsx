"use client";

import { FormEvent, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { settingsText } from "@/components/Admin/settings/settingsText";
import type {
    EventScheduleState,
    UpdateEventSchedulePayload,
} from "@/services/eventScheduleService";
import { DateTimeInput } from "./DateTimeInput";

function toDatetimeLocalValue(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(localValue: string): string | null {
    if (!localValue) return null;
    const date = new Date(localValue);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

function formatLithuanianDateTime(iso: string | null, fallback: string): string {
    if (!iso) return fallback;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return fallback;

    const datePart = new Intl.DateTimeFormat("lt-LT", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("lt-LT", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);

    return `${datePart} ${timePart}`;
}

type EventScheduleSectionProps = {
    schedule: EventScheduleState | null;
    loading: boolean;
    saving: boolean;
    onSave: (payload: UpdateEventSchedulePayload) => Promise<void>;
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

    const [eventStartInput, setEventStartInput] = useState("");
    const [votingStartInput, setVotingStartInput] = useState("");
    const [votingEndInput, setVotingEndInput] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (!schedule) return;
        setEventStartInput(toDatetimeLocalValue(schedule.eventStartsAt));
        setVotingStartInput(toDatetimeLocalValue(schedule.votingStartsAt));
        setVotingEndInput(toDatetimeLocalValue(schedule.votingEndsAt));
    }, [schedule]);

    function validateVotingWindow(): boolean {
        if (!votingStartInput || !votingEndInput) {
            setValidationError(null);
            return true;
        }
        const startMs = Date.parse(votingStartInput);
        const endMs = Date.parse(votingEndInput);
        if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
            setValidationError(t.invalidRangeError);
            return false;
        }
        setValidationError(null);
        return true;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validateVotingWindow() || saving) return;

        await onSave({
            eventStartsAt: fromDatetimeLocalValue(eventStartInput),
            votingStartsAt: fromDatetimeLocalValue(votingStartInput),
            votingEndsAt: fromDatetimeLocalValue(votingEndInput),
        });
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
                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                    <DateTimeInput
                        id="event-start"
                        label={t.eventStart}
                        value={eventStartInput}
                        dateAriaLabel={t.dateAriaLabel(t.eventStart)}
                        timeAriaLabel={t.timeAriaLabel(t.eventStart)}
                        onChange={(val) => {
                            setEventStartInput(val);
                            onInputEdit();
                        }}
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
                        onBlur={validateVotingWindow}
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
                        onBlur={validateVotingWindow}
                    />

                    {validationError && (
                        <p role="alert" className="text-sm font-medium text-rose-400">
                            {validationError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
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
                                {formatLithuanianDateTime(schedule.votingEndsAt, t.notSet)}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </section>
    );
}