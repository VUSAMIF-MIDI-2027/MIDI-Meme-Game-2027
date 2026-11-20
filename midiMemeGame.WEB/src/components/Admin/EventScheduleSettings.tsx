"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@clerk/react";
import { eventScheduleText } from "@/app/admin/pageText";
import { useLanguage } from "@/context/LanguageContext";
import {
    EventScheduleError, eventScheduleFields, getEventSchedule, saveEventSchedule,
    type EventSchedule, type EventScheduleField,
} from "@/services/eventScheduleService";
import { EventScheduleForm } from "./EventScheduleForm";
import { formatVilniusInput, parseVilniusInput } from "./eventScheduleTime";

const REQUEST_TIMEOUT_MS = 20_000;
const emptyValues: EventSchedule = { eventStartsAt: "", votingStartsAt: "", eventEndsAt: "" };
type ErrorKey = "invalidTime" | "order" | "votingOrder" | "endOrder" | "denied" | "saveError";

function toFormValues(schedule: EventSchedule): EventSchedule {
    return {
        eventStartsAt: formatVilniusInput(schedule.eventStartsAt),
        votingStartsAt: formatVilniusInput(schedule.votingStartsAt),
        eventEndsAt: formatVilniusInput(schedule.eventEndsAt),
    };
}

export function EventScheduleSettings() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const copy = eventScheduleText[lang];
    const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
    const [attempt, setAttempt] = useState(0);
    const [schedule, setSchedule] = useState<EventSchedule | null>(null);
    const [values, setValues] = useState(emptyValues);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<ErrorKey | null>(null);
    const [invalidField, setInvalidField] = useState<EventScheduleField | null>(null);
    const activeSave = useRef<AbortController | null>(null);
    const originalValues = schedule ? toFormValues(schedule) : emptyValues;
    const isDirty = eventScheduleFields.some(field => values[field] !== originalValues[field]);

    useEffect(() => {
        const request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
        void getEventSchedule(signal).then(stored => {
            if (request.signal.aborted) return;
            setSchedule(stored);
            setValues(stored ? toFormValues(stored) : emptyValues);
            setLoadState("ready");
        }).catch(() => {
            if (!request.signal.aborted) setLoadState("error");
        });

        return () => {
            request.abort();
            activeSave.current?.abort();
        };
    }, [attempt]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isDirty || activeSave.current) return;
        setError(null);
        setInvalidField(null);
        setSaved(false);

        const updated = { ...emptyValues };
        for (const field of eventScheduleFields) {
            // Preserve the exact stored instant for unchanged fields, including seconds and offsets.
            const instant = schedule && values[field] === originalValues[field]
                ? schedule[field]
                : parseVilniusInput(values[field]);
            if (!instant) {
                setError("invalidTime");
                setInvalidField(field);
                return;
            }
            updated[field] = instant;
        }

        const [start, voting, end] = eventScheduleFields.map(field => Date.parse(updated[field]));
        if (voting <= start) {
            setError("votingOrder");
            setInvalidField("votingStartsAt");
            return;
        }
        if (end <= voting) {
            setError("endOrder");
            setInvalidField("eventEndsAt");
            return;
        }

        const request = new AbortController();
        activeSave.current = request;
        setSaving(true);
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
        try {
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) {
                setError("denied");
                return;
            }
            const stored = await saveEventSchedule(updated, token, signal);
            if (request.signal.aborted) return;
            setSchedule(stored);
            setValues(toFormValues(stored));
            setSaved(true);
        } catch (cause) {
            if (request.signal.aborted) return;
            if (cause instanceof EventScheduleError && (cause.status === 401 || cause.status === 403)) {
                setError("denied");
            } else if (cause instanceof EventScheduleError && cause.code === 2401) {
                setError("order");
            } else {
                setError("saveError");
            }
        } finally {
            activeSave.current = null;
            if (!request.signal.aborted) setSaving(false);
        }
    }

    if (loadState === "loading") return <p role="status" className="text-sm text-white/75">{copy.loading}</p>;
    if (loadState === "error") return (
        <div>
            <p role="alert" className="text-sm text-red-300">{copy.loadError}</p>
            <button
                type="button"
                onClick={() => { setLoadState("loading"); setAttempt(value => value + 1); }}
                className="mt-3 min-h-11 rounded-lg px-3 font-semibold text-[#70cfff] underline focus-visible:outline-2 focus-visible:outline-midi-blue"
            >
                {copy.retry}
            </button>
        </div>
    );

    return (
        <EventScheduleForm
            copy={copy}
            values={values}
            isNew={schedule === null}
            isDirty={isDirty}
            saving={saving}
            feedback={error ? { type: "error", message: copy[error] } : saved ? { type: "success", message: copy.saved } : null}
            invalidField={invalidField}
            onChange={(field, value) => {
                setValues(current => ({ ...current, [field]: value }));
                setError(null);
                setInvalidField(null);
                setSaved(false);
            }}
            onSubmit={submit}
        />
    );
}
