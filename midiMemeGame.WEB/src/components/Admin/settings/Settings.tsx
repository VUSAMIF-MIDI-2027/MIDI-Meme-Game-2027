"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { settingsText } from "./settingsText";
import {
    getEventSchedule,
    updateEventSchedule,
    type EventScheduleState,
    type UpdateEventSchedulePayload,
} from "@/services/eventScheduleService";
import { EventScheduleSection } from "./EventScheduleSection";
import { GrantAdminSection } from "@/components/Admin/settings/GrantAdminField";
import { ResetRulesAcknowledgementsField } from "@/components/Admin/settings/ResetRulesAcknowledgementsField";

export function Settings() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = settingsText[lang];

    const request = useRef<AbortController | null>(null);

    const [schedule, setSchedule] = useState<EventScheduleState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        request.current = controller;

        async function load() {
            setLoading(true);
            setErrorMessage(null);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new Error("Missing authentication token");

                const data = await getEventSchedule(token, signal);
                if (!controller.signal.aborted) {
                    setSchedule(data);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    console.error("Failed to load schedule:", cause);
                    setErrorMessage(t.loadError);
                }
            } finally {
                if (request.current === controller) {
                    request.current = null;
                }
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            controller.abort();
        };
    }, [getToken, t.loadError]);

    async function handleSaveSchedule(payload: UpdateEventSchedulePayload) {
        setFeedbackMessage(null);
        setErrorMessage(null);
        setSaving(true);

        try {
            const signal = AbortSignal.timeout(20_000);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new Error("Missing authentication token");

            const updated = await updateEventSchedule(payload, token, signal);
            setSchedule(updated);
            setFeedbackMessage(t.scheduleSaved);
        } catch (cause) {
            console.error("Failed to save schedule:", cause);
            setErrorMessage(t.saveError);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {errorMessage && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300"
                >
                    {errorMessage}
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
                onInputEdit={() => setFeedbackMessage(null)}
            />
            <GrantAdminSection />
            <ResetRulesAcknowledgementsField />
        </div>
    );
}