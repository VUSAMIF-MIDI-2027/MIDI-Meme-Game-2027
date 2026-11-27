"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import Image from "next/image";
import { LangToggle } from "@/components/LangToggle";
import { useLanguage } from "@/context/LanguageContext";

import { getCurrentUser, acknowledgeRules } from "@/services/userService";
const STEP_COOLDOWN_SECONDS = 4;

const illustrations = [
    { src: "/cats/trofejus2.svg", width: 44, height: 44 },
    { src: "/cats/medalis.svg", width: 36, height: 36 },
    { src: "/cats/skaitantis_kasaras.svg", width: 50, height: 50 },
];
const text = {
    lt: {
        title: "Trumpai prieš pradedant", progress: "Taisyklių žingsniai", close: "Uždaryti", back: "Atgal", next: "Toliau", read: "Visos taisyklės", accept: "Supratau",
        steps: [
            { title: "3 galimybės", detail: "Gali pateikti iki 3 memų. Pasirink pateiktą nuotrauką, pridėk prierašą ir pateik organizatorių peržiūrai.", note: "Leidimas viešai skelbti memą privalomas. Vardą ir pavardę gali pasirinkti slėpti." },
            { title: "3 balsai. 3 skirtingi memai.", detail: "Balsavimui prasidėjus, gali skirti po vieną balsą trims skirtingiems memams. Kiekvienas balsas vertas 1 taško.", note: "Vienam memui — tik vienas tavo balsas." },
            { title: "Turinio taisyklės", detail: "NSFW ir asmeniniai įžeidimai draudžiami. Toks memas bus užblokuotas ir sunaudos vieną iš tavo 3 bandymų.", note: "Užblokuoto memo bandymas negrąžinamas. Likusius bandymus gali panaudoti." },
        ],
    },
    en: {
        title: "Before you start", progress: "Rules steps", close: "Close", back: "Back", next: "Next", read: "Full rules", accept: "Got it",
        steps: [
            { title: "3 chances", detail: "Submit up to 3 memes. Choose a provided photo, add a caption and submit it for organiser review.", note: "Permission to publish the meme is required. Showing your name is optional." },
            { title: "3 votes. 3 different memes.", detail: "Once voting opens, give one vote each to up to three different memes. Each vote is worth 1 point.", note: "Only one of your votes can go to each meme." },
            { title: "Content rules", detail: "No NSFW content or personal insults. An offending meme will be blocked and use up one of your 3 attempts.", note: "The attempt is not refunded. You can still use your remaining attempts." },
        ],
    },
};

export function FirstVisitRules() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(STEP_COOLDOWN_SECONDS);
    const [loadError, setLoadError] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const dialog = useRef<HTMLDialogElement>(null);
    const firstUnfinishedStep = useRef(0);
    const cooldownDeadline = useRef(0);
    const cooldownTimer = useRef<number | undefined>(undefined);
    const submission = useRef<AbortController | null>(null);
    const t = text[lang];
    const current = t.steps[step];
    const illustration = illustrations[step];
    const last = step === t.steps.length - 1;

    const startStepCooldown = useCallback(() => {
        window.clearTimeout(cooldownTimer.current);
        const deadline = performance.now() + STEP_COOLDOWN_SECONDS * 1000;
        cooldownDeadline.current = deadline;

        function tick() {
            const remaining = Math.max(0, deadline - performance.now());
            const seconds = Math.ceil(remaining / 1000);
            setSecondsLeft(seconds);
            if (seconds > 0) {
                cooldownTimer.current = window.setTimeout(tick, remaining - (seconds - 1) * 1000);
            }
        }

        tick();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
        const element = dialog.current;
        async function load() {
            try {
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new Error("Missing session token.");
                const user = await getCurrentUser(token, signal);
                if (controller.signal.aborted) return;
                setLoadError(false);
                if (user.rulesAcknowledgedAtUtc === null && element && !element.open) {
                    startStepCooldown();
                    element.showModal();
                }
            } catch {
                if (!controller.signal.aborted) setLoadError(true);
            }
        }
        void load();
        return () => {
            controller.abort();
            submission.current?.abort();
            window.clearTimeout(cooldownTimer.current);
            element?.close();
        };
    }, [getToken, attempt, startStepCooldown]);

    async function acknowledge() {
        if (submission.current) return;
        const controller = new AbortController();
        submission.current = controller;
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
        setSaving(true);
        setSaveError(false);
        try {
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new Error("Missing session token.");
            await acknowledgeRules(token, signal);
            if (!controller.signal.aborted) dialog.current?.close();
        } catch {
            if (!controller.signal.aborted) setSaveError(true);
        } finally {
            submission.current = null;
            if (!controller.signal.aborted) setSaving(false);
        }
    }
    function goToStep(nextStep: number) {
        if (nextStep < firstUnfinishedStep.current) {
            window.clearTimeout(cooldownTimer.current);
            cooldownDeadline.current = 0;
            setSecondsLeft(0);
        } else {
            startStepCooldown();
        }
        setStep(nextStep);
    }

    function advance() {
        if (performance.now() < cooldownDeadline.current) return;
        if (last) {
            void acknowledge();
            return;
        }

        firstUnfinishedStep.current = Math.max(firstUnfinishedStep.current, step + 1);
        goToStep(step + 1);
    }

    return (
        <>
        {loadError && <div role="alert" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-lg border border-white/20 bg-[#090d10] p-4 text-white">
            <p>{lang === "lt" ? "Nepavyko patikrinti taisyklių patvirtinimo." : "Could not check your rules acknowledgement."}</p>
            <button type="button" onClick={() => { setLoadError(false); setAttempt(value => value + 1); }} className="shrink-0 text-[#70cfff] underline">{lang === "lt" ? "Bandyti dar kartą" : "Retry"}</button>
        </div>}
        <dialog ref={dialog} aria-labelledby="first-rules-title" onCancel={event => { if (saving) event.preventDefault(); }}
            onClose={() => { if (!dialog.current?.open) window.clearTimeout(cooldownTimer.current); }}
            className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-white/15 bg-[#080d11] p-6 text-white shadow-2xl backdrop:bg-black/80 sm:p-8">
            <div className="flex items-center justify-between gap-3">
                <h2 id="first-rules-title" className="text-sm font-semibold text-white/70">{t.title}</h2>
                <button type="button" disabled={saving} aria-label={t.close} onClick={() => dialog.current?.close()} className="flex size-10 items-center justify-center rounded hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-midi-blue"><X className="size-5" aria-hidden="true" /></button>
            </div>
            <ol aria-label={t.progress} className="mt-4 grid grid-cols-3 gap-3">
                {t.steps.map((item, index) => <li key={item.title} aria-current={index === step ? "step" : undefined} className={`border-t-2 pt-2 text-xs font-bold tracking-widest ${index <= step ? "border-midi-blue text-[#70cfff]" : "border-white/15 text-white/35"}`}>0{index + 1}</li>)}
            </ol>
            <div aria-live="polite" aria-atomic="true" className="min-h-64 pt-7 sm:min-h-72">
                <Image
                    {...illustration}
                    alt=""
                    className="mb-3 size-20 object-contain [image-rendering:pixelated] sm:size-24"
                />
                <h3 className="text-3xl font-bold leading-tight">{current.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-white/90">{current.detail}</p>
                <p className={`mt-4 text-sm leading-relaxed ${last ? "text-amber-200" : "text-[#70cfff]"}`}>{current.note}</p>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" disabled={step === 0 || saving} onClick={() => goToStep(step - 1)} className="inline-flex min-h-11 items-center gap-2 rounded px-2 text-white/80 disabled:invisible focus-visible:outline-2 focus-visible:outline-midi-blue"><ArrowLeft aria-hidden="true" className="size-4" />{t.back}</button>
                <button type="button" disabled={saving || secondsLeft > 0} aria-busy={saving} onClick={advance} className="inline-flex min-h-11 items-center gap-3 rounded bg-midi-blue px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    {saving ? (lang === "lt" ? "Išsaugoma…" : "Saving…") : last ? t.accept : t.next}
                    {secondsLeft > 0 ? (
                        <span className="whitespace-nowrap text-xs tabular-nums">{secondsLeft} s</span>
                    ) : last ? <Check aria-hidden="true" className="size-4" /> : <ArrowRight aria-hidden="true" className="size-4" />}
                </button>
            </div>
            {saveError && <p role="alert" className="mt-4 text-sm text-red-300">{lang === "lt" ? "Nepavyko išsaugoti. Pabandyk dar kartą." : "Could not save. Please try again."}</p>}
            <div className="mt-6 flex items-center">
                <LangToggle compact />
            </div>
        </dialog>
        </>
    );
}


