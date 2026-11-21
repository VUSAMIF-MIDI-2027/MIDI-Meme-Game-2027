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
import { EventScheduleSection } from "./EventScheduleSection";
import { GrantAdminSection } from "./GrantAdminSection";
import { ResetRulesAcknowledgementsSection } from "./ResetRulesAcknowledgementsSection";

const REQUEST_TIMEOUT_MS = 20_000;

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
    const [errorKey, setErrorKey] = useState<"loadError" | "saveError" | "invalidRangeError" | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        activeLoad.current = controller;

        async function load() {
            setLoading(true);
            setErrorKey(null);
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
                    console.error("Failed to load schedule:", cause);
                    setErrorKey("loadError");
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
        setErrorKey(null);
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
            if (!token) throw new Error("Missing authentication token");

            const updated = await saveEventSchedule(nextSchedule, token, signal);
            if (!controller.signal.aborted) {
                setSchedule(updated);
                setFeedbackMessage(t.scheduleSaved);
            }
        } catch (cause) {
            if (!controller.signal.aborted) {
                console.error("Failed to save schedule:", cause);
                if (cause instanceof EventScheduleError && cause.code === 2401) {
                    setErrorKey("invalidRangeError");
                } else {
                    setErrorKey("saveError");
                }
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
            {errorKey && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300"
                >
                    {t[errorKey]}
                </div>
            )}

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
                    setErrorKey(null);
                }}
            />
            <GrantAdminSection />
            <ResetRulesAcknowledgementsSection />
        </div>
    );
}