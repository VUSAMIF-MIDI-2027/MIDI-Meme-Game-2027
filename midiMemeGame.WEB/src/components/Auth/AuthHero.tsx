"use client"

import { authText } from "@/app/login/pageText";
import { useLanguage } from "@/context/LanguageContext";
import { ui } from "@/styles/ui";
import { Clock } from "lucide-react";
import Image from "next/image";
import moon from "#/public/images/moon-current.webp";

export function AuthHero() {
    const { lang } = useLanguage();
    const t = authText[lang];

    return (
        <div
            className={`
                    relative isolate flex flex-col overflow-hidden
                    bg-auth-hero-background px-6 py-10
                    lg:sticky lg:top-17 lg:h-[calc(100svh-4.25rem)]
                    lg:px-16 lg:py-16 2xl:px-24 2xl:py-24
                `}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-20"
                style={{ background: "radial-gradient(circle at 72% 45%, rgba(0, 117, 181, 0.17), transparent 35%)" }}
            />

            <Image
                loading="eager"
                src={moon}
                alt=""
                sizes="(min-width: 1536px) 720px, (min-width: 1024px) 460px, 260px"
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-20 -z-10 size-[260px] object-contain opacity-35 lg:-bottom-24 lg:-right-28 lg:size-[460px] 2xl:size-[720px] 2xl:-right-36 2xl:-bottom-40"
            />

            <div className={ui.contentLayer}>
                <p className={ui.eyebrow}>
                    {t.miniTitle}
                </p>

                <h1 className="mt-4 max-w-[680px] text-white text-5xl font-bold leading-[1.02] tracking-tight lg:text-7xl 2xl:text-[112px] 2xl:leading-[0.94]">
                    {t.titlePrefix}{" "}
                    MIDI
                    <span className="block text-midi-blue">
                        {t.titleEnding}
                    </span>
                </h1>

                <p className={`${ui.description} mt-5 max-w-lg`}>
                    {t.description}
                </p>
            </div>
            <div className="relative z-10 mt-auto flex flex-wrap items-center gap-3 pt-32 lg:pt-8">
                <Clock
                    aria-hidden="true"
                    className="size-4 shrink-0 text-midi-blue"
                    strokeWidth={1.8}
                />
                <span
                    className="text-xs font-semibold uppercase tracking-wide">
                    {t.submissionsCloseIn}
                </span>
                <span
                    className="text-3xl font-bold tabular-nums text-midi-blue">

                </span>
            </div>
        </div>
    )
}

