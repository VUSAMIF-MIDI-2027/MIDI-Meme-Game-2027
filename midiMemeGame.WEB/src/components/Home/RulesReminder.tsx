"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { rulesText } from "./rulesText";

export function RulesReminder() {
    const { lang } = useLanguage();
    const t = rulesText[lang];
    return (
        <aside className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6">
            <div className="border-l-2 border-midi-blue bg-midi-blue/5 px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
                <div>
                    <h2 className="text-lg font-bold text-midi-gray">{t.reminderTitle}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">{t.reminder}</p>
                </div>
                <Link href="/rules" className="mt-4 inline-flex min-h-11 shrink-0 items-center font-semibold text-[#70cfff] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-midi-blue sm:mt-0">{t.read}</Link>
            </div>
        </aside>
    );
}
