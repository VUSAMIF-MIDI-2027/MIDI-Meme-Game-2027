"use client"

import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/app/pageText";

export default function ParticipationSteps() {
    const { lang } = useLanguage();
    const t = text[lang];
    const steps = [t.step1, t.step2, t.step3];

    return (
        <ol className="relative z-10 mx-auto mt-7.5 grid w-full max-w-242.5 grid-cols-1 sm:mt-13.75 sm:grid-cols-3">
            {steps.map((step, index) => (
                <li
                    key={step}
                    className="flex items-center gap-3.5 px-2 py-4 text-lg not-first:border-t not-first:border-white/10 sm:justify-center sm:px-3 sm:py-5 sm:text-[19px] sm:not-first:border-t-0 sm:not-first:border-l"
                >
                    <span className="text-[13px] font-bold tracking-widest text-midi-blue">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                </li>
            ))}
        </ol>
    )
}