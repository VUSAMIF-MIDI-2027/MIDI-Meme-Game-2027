"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { settingsText } from "./settingsText";
import {
    EventScheduleError,
    getEventSchedule,
    saveEventSchedule,
    type EventSchedule,
} from "@/services/eventScheduleService";
import { ApiError } from "@/services/ApiError";
import { ErrorNotice } from "@/components/ErrorNotice";
import { EventScheduleSection } from "./EventScheduleSection";
import { GrantAdminSection } from "./GrantAdminSection";
import { ResetRulesAcknowledgementsSection } from "./ResetRulesAcknowledgementsSection";

const REQUEST_TIMEOUT_MS = 20_000;

type ScheduleError = { cause: unknown; scope: "scheduleLoad" | "scheduleSave" } | null;

// eventScheduleService doesn't throw ApiError yet: map it so ErrorNotice can read status and code
const toApiError = (cause: unknown) =>
    cause instanceof EventScheduleError ? new ApiError(cause.status, cause.code ?? null) : cause;

export function Settings() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = settingsText[lang];

    const activeLoad = useRef<AbortController | null>(null);
    const activeSave = useRef<AbortController | null>(null);

    const [schedule, setSchedule] = useState<EventSchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [error, setError] = useState<ScheduleError>(null);

    useEffect(() => {
        const controller = new AbortController();
        activeLoad.current = controller;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                ]);

                const data = await getEventSchedule(signal);
                if (!controller.signal.aborted) {
                    setSchedule(data);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setError({ cause: toApiError(cause), scope: "scheduleLoad" });
                }
            } finally {
                if (activeLoad.current === controller) {
                    activeLoad.current = null;
                }
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            controller.abort();
            activeSave.current?.abort();
        };
    }, []);

    async function handleSaveSchedule(nextSchedule: EventSchedule) {
        if (activeSave.current) return;

        setFeedbackMessage(null);
        setError(null);
        setSaving(true);

        const controller = new AbortController();
        activeSave.current = controller;

        try {
            const signal = AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            ]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw ApiError.unauthorized();

            const updated = await saveEventSchedule(nextSchedule, token, signal);
            if (!controller.signal.aborted) {
                setSchedule(updated);
                setFeedbackMessage(t.scheduleSaved);
            }
        } catch (cause) {
            if (!controller.signal.aborted) {
                setError({ cause: toApiError(cause), scope: "scheduleSave" });
            }
        } finally {
            if (activeSave.current === controller) {
                activeSave.current = null;
            }
            if (!controller.signal.aborted) {
                setSaving(false);
            }
        }
    }

    return (
        <div className="space-y-6">
            <ErrorNotice error={error?.cause} scope={error?.scope} />

            {feedbackMessage && (
                <div
                    role="status"
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300"
                >
                    {feedbackMessage}
                </div>
            )}

            <EventScheduleSection
                schedule={schedule}
                loading={loading}
                saving={saving}
                onSave={handleSaveSchedule}
                onInputEdit={() => {
                    setFeedbackMessage(null);
                    setError(null);
                }}
            />
            <GrantAdminSection />
            <ResetRulesAcknowledgementsSection />
        </div>
    );
}