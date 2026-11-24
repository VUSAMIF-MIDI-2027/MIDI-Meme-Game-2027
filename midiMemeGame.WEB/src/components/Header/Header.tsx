"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/react";
import { AccountMenu } from "@/components/Auth/AccountMenu";
import { LogoutButton } from "@/components/Auth/LogoutButton";
import { MobileMenu } from "../MobileMenu";

import logoMidiBlack from "#/public/logos/MIDI-Logotipas-naktis.png"
import Image from "next/image";
import Link from "next/link";
import burgerIcon from "#/public/icons/burgerIcon.svg"
import closeIcon from "#/public/icons/closeIcon.svg"
import { useLanguage } from "@/context/LanguageContext";
import { LangToggle } from "../LangToggle";
import { links, participantLinks, text } from "@/components/Header/HeaderText";
import { isCurrentPath } from "./isCurrentPath";
import { useEventPhase } from "@/hooks/useEventPhase";
import { useEventSchedule } from "@/hooks/useEventSchedule";

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { lang } = useLanguage();
    const t = text[lang];
    const { isLoaded, isSignedIn, sessionClaims } = useAuth();
    const pathname = usePathname();
    const isAdmin = sessionClaims?.role === "admin";
    const { state: scheduleState } = useEventSchedule({ enabled: isSignedIn === true });
    const { phase } = useEventPhase(scheduleState.status === "ready" ? scheduleState.schedule : undefined);
    const navLinks = participantLinks.map(link => {
        if (link.href === "/dashboard/create") return { ...link, disabled: phase !== "submissions" };
        if (link.href === "/dashboard/gallery") return { ...link, disabled: phase !== "voting" };
        if (link.href === "/results") return { ...link, disabled: phase !== "ended" };
        return link;
    });
    const mobileLinks = isAdmin
        ? [...navLinks, { href: "/admin", label: { lt: "Administravimas", en: "Administration" }, disabled: false }]
        : navLinks;
    const showPublicNavigation = !isSignedIn && !pathname.startsWith("/dashboard");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-17 items-center justify-between border-b border-midi-charcoal bg-midi-black px-4 sm:px-10">
            <Link href={isSignedIn ? "/dashboard" : "/"} className="flex min-w-0 items-center gap-2 sm:gap-3">
                <Image loading="eager"
                    src={logoMidiBlack}
                    alt="MIDI logo"
                    className="h-11 w-auto object-contain"
                    priority
                />

                <div className={`min-w-0 max-w-[145px] text-left sm:max-w-none ${isSignedIn ? "min-[1100px]:hidden min-[1400px]:block" : ""}`}>
                    <div className="text-[11px] font-bold uppercase leading-[1.4] tracking-[0.2em] text-midi-blue">
                        {t.titleTop}
                    </div>

                    <div className="text-[9px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-midi-white/80">
                        {t.titleBottom}
                    </div>
                </div>
            </Link>

            <div className={`pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 ${isSignedIn ? "" : "min-[1100px]:block"}`}>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-midi-gray">
                    {t.headerCenter}
                </span>
            </div>

            {isLoaded && isSignedIn && (
                <div className="flex items-center gap-2 sm:gap-3">
                    <nav aria-label={lang === "lt" ? "Dalyvio navigacija" : "Participant navigation"} className="hidden items-center gap-4 min-[1100px]:flex">
                        {navLinks.map(({ href, label, disabled, primary, exact }) => {
                            const active = !disabled && isCurrentPath(pathname, href, exact);
                            const className = primary
                                ? ("rounded bg-midi-blue px-4 py-3 text-sm font-bold text-white" + (active ? " ring-2 ring-[#70cfff] ring-offset-2 ring-offset-midi-black" : ""))
                                : `border-b-2 py-3 text-sm font-semibold transition-colors ${active ? "border-midi-blue text-[#70cfff]" : "border-transparent text-white/85 hover:text-white"}`;

                            return disabled ? (
                                <span key={href} role="link" aria-disabled="true" className={`${className} cursor-not-allowed opacity-40`}>
                                    {label[lang]}
                                </span>
                            ) : (
                                <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue`}>
                                    {label[lang]}
                                </Link>
                            );
                        })}
                    </nav>
                    {isAdmin && (
                        <div className="hidden items-center justify-center border-x border-midi-charcoal px-5 min-[1100px]:flex">
                        <Link
                            href="/admin"
                            aria-current={isCurrentPath(pathname, "/admin") ? "page" : undefined}
                            aria-label={lang === "lt" ? "Administravimas" : "Administration"}
                            title={lang === "lt" ? "Administravimas" : "Administration"}
                            className={`inline-flex items-center justify-center rounded bg-midi-blue px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-midi-blue/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${isCurrentPath(pathname, "/admin") ? "ring-1 ring-[#70cfff]" : ""}`}
                        >
                            <span className="hidden min-[1100px]:inline">{lang === "lt" ? "Administravimas" : "Administration"}</span>
                        </Link>
                        </div>
                    )}
                    <div className={`hidden items-center gap-3 min-[1100px]:flex ${!isAdmin ? "ml-2 border-l border-midi-charcoal pl-5" : ""}`}>
                        <AccountMenu />
                        <LogoutButton />
                    </div>
                    <LangToggle />
                    <button
                        type="button"
                        aria-label={menuOpen ? (lang === "lt" ? "Uždaryti meniu" : "Close menu") : (lang === "lt" ? "Atidaryti meniu" : "Open menu")}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-midi-blue min-[1100px]:hidden"
                    >
                        <Image src={menuOpen ? closeIcon : burgerIcon} alt="" className="h-7 w-auto" />
                    </button>
                    <MobileMenu menuOpen={menuOpen} links={mobileLinks} participant onClose={() => setMenuOpen(false)} />
                </div>
            )}
            {showPublicNavigation && <>
                <div className="flex items-center gap-3 sm:gap-6 min-[1100px]:hidden">

                    <LangToggle />
                    <button
                        className="shrink-0"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        <Image loading="eager"
                            src={menuOpen ? closeIcon : burgerIcon}
                            alt={menuOpen ? "Close menu" : "Open menu"}
                            className="h-8 w-auto transition-transform active:scale-90 shrink-0"
                        />
                    </button>

                </div>
                <MobileMenu
                    menuOpen={menuOpen}
                    links={links}
                    onClose={() => setMenuOpen(false)}
                />

                <div className="hidden items-center gap-2 min-[1100px]:flex">
                    <nav className="flex gap-1 ">
                        {links
                            .map(({ href, label }) => {
                                const active = isCurrentPath(pathname, href);

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={active ? "page" : undefined}
                                        className={`rounded px-4 py-1.75 text-sm font-medium uppercase tracking-[0.08em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70cfff] ${active
                                            ? "bg-[#0075b5]/20 font-bold text-[#70cfff]"
                                            : "text-[#e5e7eb] hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {label[lang]}
                                    </Link>

                                );
                            })}
                    </nav>

                    <LangToggle />
                </div>

            </>}
        </header>
    );
}




