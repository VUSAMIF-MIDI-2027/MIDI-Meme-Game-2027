"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { resetRulesAcknowledgements } from "@/services/userService";
import { ApiError } from "@/services/ApiError";
import { ErrorNotice } from "@/components/ErrorNotice";
import { settingsText } from "./settingsText";

export function ResetRulesAcknowledgementsSection() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = settingsText[lang].resetRules;

    const dialog = useRef<HTMLDialogElement>(null);
    const request = useRef<AbortController | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [updated, setUpdated] = useState<number | null>(null);

    useEffect(() => () => {
        request.current?.abort();
    }, []);

    async function reset() {
        if (request.current) return;
        const controller = new AbortController();
        request.current = controller;

        setSaving(true);
        setError(null);
        setUpdated(null);

        try {
            const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw ApiError.unauthorized();
            const count = await resetRulesAcknowledgements(token, signal);
            if (!controller.signal.aborted) {
                setUpdated(count);
                dialog.current?.close();
            }
        } catch (cause) {
            if (!controller.signal.aborted) {
                // resetRulesAcknowledgements doesn't throw ApiError yet: keep its access-denied case
                setError(cause instanceof Error && cause.message === "ACCESS_DENIED" ? new ApiError(403) : cause);
            }
        } finally {
            if (request.current === controller) request.current = null;
            if (!controller.signal.aborted) setSaving(false);
        }
    }

    return (
        <section aria-labelledby="reset-rules-title" className="rounded-xl border border-white/15 bg-[#0d1013] p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
                <RotateCcw className="size-5 text-midi-blue" aria-hidden="true" />
                <h2 id="reset-rules-title" className="text-xl font-bold text-white">
                    {t.title}
                </h2>
            </div>
            <p className="mt-1.5 text-sm text-white/60">{t.description}</p>

            <button
                type="button"
                onClick={() => {
                    setError(null);
                    dialog.current?.showModal();
                }}
                className="mt-5 min-h-11 w-full cursor-pointer rounded-lg border border-amber-300/40 bg-amber-400/5 px-4 py-2.5 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:w-auto"
            >
                {t.action}
            </button>

            {updated !== null && (
                <p role="status" className="mt-4 text-sm font-medium text-emerald-300">
                    {updated === 0 ? t.empty : `${t.success} ${updated}`}
                </p>
            )}

            <dialog
                ref={dialog}
                aria-labelledby="reset-confirm-title"
                aria-describedby="reset-confirm-description"
                onCancel={(event) => {
                    if (saving) event.preventDefault();
                }}
                className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-white/15 bg-[#0d1013] p-6 text-white shadow-2xl backdrop:bg-black/80 sm:p-8"
            >
                <h2 id="reset-confirm-title" className="text-2xl font-bold text-white">
                    {t.confirm}
                </h2>
                <p id="reset-confirm-description" className="mt-4 text-sm leading-relaxed text-white/75">
                    {t.warning}
                </p>
                <ErrorNotice error={error} scope="resetRules" className="mt-4" />
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => dialog.current?.close()}
                        className="min-h-11 cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t.cancel}
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        aria-busy={saving}
                        onClick={() => void reset()}
                        className="min-h-11 cursor-pointer rounded-lg bg-midi-blue px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                    >
                        {saving ? t.saving : t.submit}
                    </button>
                </div>
            </dialog>
        </section>
    );
}