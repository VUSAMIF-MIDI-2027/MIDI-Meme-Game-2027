"use client"

import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/app/pageText";
import { SleepingCat } from "./SleepingCat";
import catStyles from "./SleepingCat.module.css";
import { ArrowUpRight, Clock } from "lucide-react";
import Countdown from "./Countdown";
import Link from "next/link";

export default function EventCountdown() {
    const { lang } = useLanguage();
    const t = text[lang];

    return (
        <section
            className="pointer-events-none relative z-10 mx-auto mt-8.5 w-full max-w-190 text-center sm:mt-8"
            aria-labelledby="countdown-heading"
        >
            <h2
                id="countdown-heading"
                className="text-[11px] font-extrabold tracking-widest uppercase sm:text-sm sm:tracking-[0.12em]"
            >
                {t.startsSoon}
            </h2>
            <div className="relative flow-root">
                <SleepingCat className={catStyles.perched} />
                <Countdown />
            </div>
            <p className="mt-5.75 flex flex-wrap items-center justify-center gap-1.25 text-base font-bold sm:gap-1.75 sm:text-[19px]">
                <Clock
                    aria-hidden="true"
                    className="size-5 shrink-0 text-midi-blue"
                    strokeWidth={2}
                />
                <time dateTime="2026-11-27T21:00:00+02:00">{t.dateTime}</time>
            </p>
            <p className="mx-auto mt-3 max-w-75 text-[15px] font-semibold text-midi-blue sm:mt-2 sm:max-w-none sm:text-[17px]">
                {t.registrationNotice}
            </p>
            <div className="mt-6 flex justify-center">
                <Link
                    href="login"
                    className="pointer-events-auto cta-main-btn group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-midi-blue px-8 py-3 
                            text-base font-bold text-white transition-colors duration-150 hover:bg-midi-blue/85 focus-visible:outline-2 
                            focus-visible:outline-offset-4 focus-visible:outline-midi-blue sm:w-auto"
                >
                    {t.registerButton}
                    <ArrowUpRight size={20} className="shrink-0" aria-hidden="true" />
                </Link>
            </div>
        </section>
    )
}