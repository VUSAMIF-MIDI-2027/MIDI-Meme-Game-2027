"use client";

import Link from "next/link"
import logoMidiBlack from "#/public/logos/MIDI-Logotipas-melyna-balta.png"
import logoVusaMif from "#/public/logos/VUSAMIF-baltas.png"
import Image from "next/image"
import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/components/Footer/FooterText"

export function Footer() {
    const { lang } = useLanguage();
    const t = text[lang];

    return (
        <footer className="border-t border-midi-charcoal bg-midi-black">
            <div
                className="flex flex-col items-center gap-6 px-8 py-6 min-[530px]:max-[669px]:grid min-[530px]:max-[669px]:grid-cols-2 min-[670px]:flex-row min-[670px]:justify-between">
                <div
                    className="flex items-center gap-3 min-[530px]:max-[669px]:justify-self-start"
                >
                    <Image
                        src={logoMidiBlack}
                        alt="MIDI"
                        className="h-8 w-auto object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-midi-white/60">
                            {t.title}
                        </span>
                    </div>
                </div>
                <span className="text-center text-sm text-midi-white/50 min-[530px]:max-[669px]:justify-self-end">
                    {t.copyright}
                </span>
                <Link
                    href="https://mif.vusa.lt/lt"
                    target="_blank"
                    className="flex items-center gap-3 min-[530px]:max-[669px]:col-span-2 min-[530px]:max-[669px]:justify-self-center"
                >
                    <Image
                        src={logoVusaMif}
                        alt="VU SA MIF"
                        className="h-12 w-auto opacity-80"
                    />

                    <div className="flex flex-col">
                        <span className="text-sm text-midi-white/60">
                            {t.organisedBy}
                        </span>

                        <span className="text-sm font-semibold text-midi-white/80">
                            VU SA MIF
                        </span>
                    </div>
                </Link>
            </div>
        </footer>
    )
}
