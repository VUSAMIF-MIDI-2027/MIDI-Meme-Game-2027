"use client"

import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/app/pageText";
import Image from "next/image";
import logo from "#/public/logos/MIDI-Logotipas-pilnas-baltas.png";

export default function HomeIntro() {
    const { lang } = useLanguage();
    const t = text[lang];

    return (
        <>
            <Image
                loading="eager"
                src={logo}
                alt="Matematikų ir informatikų dienos"
                priority
                sizes="(max-width: 640px) 160px, 210px"
                className="relative z-10 mx-auto mb-10 h-auto w-40 sm:mb-11 sm:w-52.5"
            />
            <section
                className="relative z-10 mx-auto w-full max-w-230 text-center"
                aria-labelledby="hero-title"
            >
                <p className="text-[11px] font-extrabold tracking-widest uppercase sm:text-sm sm:tracking-[0.12em]">
                    {t.miniTitle}
                </p>
                <h1
                    id="hero-title"
                    className="mt-6 text-[clamp(42px,11.6vw,68px)] leading-[1.08] font-extrabold tracking-[-0.035em] [&>span]:block sm:mt-5 sm:text-[clamp(52px,7.5vw,104px)] sm:leading-[1.02]"
                >
                    <span>{t.titleWhite}</span>
                    <span className="text-midi-blue">{t.titleBlue}</span>
                </h1>
                <p className="mx-auto mt-6 max-w-187.5 text-base leading-[1.65] text-pretty text-[#afb4ba] sm:mt-6.5 sm:text-lg sm:leading-[1.7]">
                    {t.description}
                </p>
            </section>
        </>
    )
}