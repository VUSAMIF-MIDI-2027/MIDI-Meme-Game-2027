"use client";

import { Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { memeApprovalText } from "./memeApprovalText";

export function MemeApproval() {
    const { lang } = useLanguage();
    const t = memeApprovalText[lang];

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-white/15 bg-[#0d1013] p-6 sm:p-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#0b0f12] text-midi-blue">
                        <Clock className="size-6" aria-hidden="true" />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-xs font-bold tracking-[0.16em] text-midi-blue uppercase">
                            {t.eyebrow}
                        </p>
                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                            {t.comingSoonTitle}
                        </h2>
                        <p className="max-w-xl text-sm leading-relaxed text-white/60">
                            {t.comingSoonDescription}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}