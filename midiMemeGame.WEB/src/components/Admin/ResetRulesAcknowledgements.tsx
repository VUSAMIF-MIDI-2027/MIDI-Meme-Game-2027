"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { resetRulesAcknowledgements } from "@/services/userService";

import { resetRulesText } from "@/app/admin/pageText";

export function ResetRulesAcknowledgements() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = resetRulesText[lang];
    const dialog = useRef<HTMLDialogElement>(null);
    const request = useRef<AbortController | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<"denied" | "error" | null>(null);
    const [updated, setUpdated] = useState<number | null>(null);

    useEffect(() => () => { request.current?.abort(); }, []);

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
            if (!token) { setError("denied"); return; }
            const count = await resetRulesAcknowledgements(token, signal);
            if (!controller.signal.aborted) {
                setUpdated(count);
                dialog.current?.close();
            }
        } catch (cause) {
            if (!controller.signal.aborted) setError(cause instanceof Error && cause.message === "ACCESS_DENIED" ? "denied" : "error");
        } finally {
            request.current = null;
            if (!controller.signal.aborted) setSaving(false);
        }
    }

    return (
        <section aria-labelledby="reset-rules-title" className="w-full">
            <h2 id="reset-rules-title" className="sr-only text-2xl font-bold text-white lg:not-sr-only">{t.title}</h2>
            <p className="mt-3 leading-relaxed text-white/75">{t.description}</p>
            <button type="button" onClick={() => { setError(null); dialog.current?.showModal(); }} className="mt-5 min-h-11 rounded border border-amber-200/40 px-5 py-3 font-semibold text-amber-200 hover:bg-amber-200/5 focus-visible:outline-2 focus-visible:outline-amber-200">{t.action}</button>
            {updated !== null && <p role="status" className="mt-4 text-[#70cfff]">{updated === 0 ? t.empty : `${t.success} ${updated}`}</p>}
            <dialog ref={dialog} aria-labelledby="reset-confirm-title" aria-describedby="reset-confirm-description" onCancel={event => { if (saving) event.preventDefault(); }} className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-white/20 bg-[#090d10] p-6 text-white shadow-2xl backdrop:bg-black/80 sm:p-8">
                <h2 id="reset-confirm-title" className="text-2xl font-bold">{t.confirm}</h2>
                <p id="reset-confirm-description" className="mt-4 leading-relaxed text-white/80">{t.warning}</p>
                {error && <p role="alert" className="mt-4 text-red-300">{t[error]}</p>}
                <div className="mt-7 flex flex-wrap justify-end gap-3">
                    <button type="button" disabled={saving} onClick={() => dialog.current?.close()} className="min-h-11 rounded border border-white/20 px-4 py-2 disabled:opacity-50">{t.cancel}</button>
                    <button type="button" disabled={saving} aria-busy={saving} onClick={() => void reset()} className="min-h-11 rounded bg-midi-blue px-4 py-2 font-bold disabled:cursor-wait disabled:opacity-50">{saving ? t.saving : t.submit}</button>
                </div>
            </dialog>
        </section>
    );
}

