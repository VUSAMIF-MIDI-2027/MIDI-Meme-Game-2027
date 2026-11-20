"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { resetRulesAcknowledgements } from "@/services/userService";

const text = {
    lt: {
        title: "Taisyklių peržiūra",
        description:
            "Atstatyk visų vartotojų taisyklių patvirtinimus. Taisyklių langą jie vėl matys perkrovę puslapį arba prisijungę iš naujo.",
        action: "Atstatyti patvirtinimus",
        confirm: "Atstatyti visiems?",
        warning:
            "Bus atstatyti visų vartotojų, įskaitant tavo, taisyklių patvirtinimai. Ankstesni patvirtinimo laikai bus pašalinti.",
        cancel: "Atšaukti",
        submit: "Taip, atstatyti visiems",
        saving: "Atstatoma…",
        success: "Atnaujinta vartotojų:",
        empty: "Nė vienas vartotojas neturėjo išsaugoto patvirtinimo.",
        error: "Nepavyko patvirtinti rezultato. Patikrink ryšį ir bandyk dar kartą.",
        denied: "Neturi teisės atlikti šio veiksmo. Prisijunk su administratoriaus paskyra.",
    },
    en: {
        title: "Rules acknowledgement",
        description:
            "Reset every user's rules acknowledgement. They will see the rules again after reloading the page or signing in again.",
        action: "Reset acknowledgements",
        confirm: "Reset for everyone?",
        warning:
            "All users' acknowledgements, including yours, will be reset. Previous acknowledgement dates will be cleared.",
        cancel: "Cancel",
        submit: "Yes, reset for everyone",
        saving: "Resetting…",
        success: "Users updated:",
        empty: "No users had an acknowledgement to reset.",
        error: "Could not confirm the result. Check your connection and try again.",
        denied: "You do not have permission to do this. Sign in with an administrator account.",
    },
};

export function ResetRulesAcknowledgementsField() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = text[lang];

    const dialog = useRef<HTMLDialogElement>(null);
    const request = useRef<AbortController | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<"denied" | "error" | null>(null);
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
            const signal = AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(20_000),
            ]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) {
                setError("denied");
                return;
            }
            const count = await resetRulesAcknowledgements(token, signal);
            if (!controller.signal.aborted) {
                setUpdated(count);
                dialog.current?.close();
            }
        } catch (cause) {
            if (!controller.signal.aborted) {
                setError(
                    cause instanceof Error && cause.message === "ACCESS_DENIED"
                        ? "denied"
                        : "error"
                );
            }
        } finally {
            request.current = null;
            if (!controller.signal.aborted) setSaving(false);
        }
    }

    return (
        <section
            aria-labelledby="reset-rules-title"
            className="rounded-xl border border-white/15 bg-[#0d1013] p-5 sm:p-6"
        >
            <div className="flex items-center gap-2.5">
                <RotateCcw className="size-5 text-midi-blue" aria-hidden="true" />
                <h2 id="reset-rules-title" className="text-xl font-bold text-white">
                    {t.title}
                </h2>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                {t.description}
            </p>

            <button
                type="button"
                onClick={() => {
                    setError(null);
                    dialog.current?.showModal();
                }}
                className="mt-5 min-h-11 cursor-pointer rounded-lg border border-amber-200/30 bg-[#0b0f12] px-4 py-2.5 text-sm font-semibold text-amber-200 transition-colors hover:border-amber-200/60 hover:bg-amber-200/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
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
                <h2 id="reset-confirm-title" className="text-2xl font-bold">
                    {t.confirm}
                </h2>
                <p
                    id="reset-confirm-description"
                    className="mt-4 text-sm leading-relaxed text-white/75"
                >
                    {t.warning}
                </p>
                {error && (
                    <p role="alert" className="mt-4 text-sm font-medium text-rose-400">
                        {t[error]}
                    </p>
                )}
                <div className="mt-7 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => dialog.current?.close()}
                        className="min-h-11 cursor-pointer rounded-lg border border-white/15 bg-[#0b0f12] px-4 py-2 text-sm font-semibold text-white/85 transition-colors hover:border-white/30 disabled:opacity-50"
                    >
                        {t.cancel}
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        aria-busy={saving}
                        onClick={() => void reset()}
                        className="min-h-11 cursor-pointer rounded-lg bg-midi-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                    >
                        {saving ? t.saving : t.submit}
                    </button>
                </div>
            </dialog>
        </section>
    );
}