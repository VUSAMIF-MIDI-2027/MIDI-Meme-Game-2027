"use client";

import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { MobileMenu } from "../MobileMenu";

import logoMidiBlack from "#/public/logos/MIDI-Logotipas-naktis.png"
import Image from "next/image";
import Link from "next/link";
// import burgerIcon from "../../../public/icons/burgerIcon.svg"
// import closeIcon from "../../../public/icons/closeIcon.svg"
import { useLanguage } from "@/context/LanguageContext";
import { LangToggle } from "../LangToggle";
import { links, text } from "@/components/Header/HeaderText";



function isCurrentPath(pathname: string, href: string) {
    const normalize = (path: string) => path === "/" ? "/" : path.replace(/\/+$/, "");
    return normalize(pathname) === normalize(href);
}

export function Header() {
    // COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER
    // const [menuOpen, setMenuOpen] = useState(false);
    const { lang } = useLanguage();
    const t = text[lang];

    const pathname = usePathname();

    const validRoutes = ["/", "/meme-game", "/activities", "/naktis-su-midi"];

    const isNotFound = !validRoutes.some((route) =>
        isCurrentPath(pathname, route)
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-17 items-center justify-between border-b border-midi-charcoal bg-midi-black px-4 sm:px-10">
            <Link href="/" className="flex items-center gap-3">
                <Image loading="eager"
                    src={logoMidiBlack}
                    alt="MIDI logo"
                    className="h-11 w-auto object-contain"
                    priority
                />

                <div className="text-left">
                    <div className="text-[11px] font-bold uppercase leading-[1.4] tracking-[0.2em] text-midi-blue">
                        {t.titleTop}
                    </div>

                    <div className="text-[9px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-midi-white/80">
                        {t.titleBottom}
                    </div>
                </div>
            </Link>

            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 min-[1100px]:block">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-midi-gray">
                    {t.headerCenter}
                </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 min-[1100px]:hidden">

                <LangToggle />

                {/* COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER */}
                {/* <button
                    className="shrink-0"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    <Image loading="eager"
                        src={menuOpen ? closeIcon : burgerIcon}
                        alt={menuOpen ? "Close menu" : "Open menu"}
                        className="h-8 w-auto transition-transform active:scale-90 shrink-0"
                    />
                </button> */}

            </div>

            {/* COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER */}
            {/* <MobileMenu
                menuOpen={menuOpen}
                links={links}
                onClose={() => setMenuOpen(false)}
            /> */}

            <div className="hidden items-center gap-2 min-[1100px]:flex">
                <nav className="flex gap-1 ">
                    {links
                        .filter(({ href }) => {
                            if (isNotFound) return false;

                            const hideWhenActive = href === "/" || href === "/meme-game";
                            return !(hideWhenActive && isCurrentPath(pathname, href));
                        })
                        .map(({ href, label }) => {
                            const active = isCurrentPath(pathname, href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className={`rounded px-4 py-1.75 text-sm font-medium uppercase tracking-[0.08em] transition-all duration-150 ${active
                                        ? "bg-[#080808] font-bold text-midi-blue"
                                        : "text-midi-gray hover:bg-[#0d0d0d]"
                                        }`}
                                >
                                    {label[lang]}
                                </Link>

                            );
                        })}
                </nav>

                <LangToggle />
            </div>

        </header>
    );
}

