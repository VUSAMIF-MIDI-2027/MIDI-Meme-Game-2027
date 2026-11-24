"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrentPath } from "./Header/isCurrentPath";
import { SignOutButton } from "@clerk/react";
import { LogOut, UserRound } from "lucide-react";

type MobileMenuProps = {
    menuOpen: boolean;
    links: NavLink[];
    onClose: () => void;
    participant?: boolean;
}

type NavLink = {
    href: string;
    label: labelLang;
    disabled?: boolean;
}

type labelLang = {
    en: string;
    lt: string;
}

export function MobileMenu({
    menuOpen,
    links,
    onClose,
    participant = false,
}: MobileMenuProps) {
    const pathname = usePathname();
    const { lang } = useLanguage();

    return (
        <nav
            inert={!menuOpen}
            aria-label={lang === "lt" ? "Navigacija" : "Navigation"}
            className={`fixed top-17 left-0 right-0 z-40 overflow-hidden bg-midi-black transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none min-[1100px]:hidden
                    ${menuOpen
                    ? "max-h-[calc(100svh-4.25rem)] overflow-y-auto overscroll-contain border-b border-white/10 shadow-xl shadow-black/40"
                    : "max-h-0 border-b-0"
                }`}
        >
            {links.map(({ href, label, disabled }) => {
                const active = !disabled && isCurrentPath(pathname, href) &&
                    !links.some((other) =>
                        other.href !== href && !other.disabled &&
                        other.href.startsWith(`${href}/`) &&
                        isCurrentPath(pathname, other.href));
                const primary = participant && href === "/dashboard/create";

                if (participant && href === "/admin") {
                    return (
                        <div key={href} className="border-b border-white/10">
                            <Link href={href} onClick={onClose} aria-current={active ? "page" : undefined}
                                className={`flex min-h-13 w-full items-center border-l-2 bg-midi-blue/60 px-12 py-4 text-left text-base font-bold text-white hover:bg-midi-blue/80 ${active ? "border-l-[#70cfff]" : "border-l-transparent"}`}>
                                {label[lang]}
                            </Link>
                        </div>
                    );
                }

                if (primary) {
                    const className = "flex min-h-13 w-full items-center border-l-4 bg-midi-blue px-12 py-4 text-left text-base font-bold text-white" + (active ? " border-l-[#b8ecff] underline underline-offset-4" : " border-l-transparent");
                    return (
                        <div key={href} className="border-b border-white/10">
                            {disabled ? (
                                <button type="button" disabled className={`${className} cursor-not-allowed opacity-40`}>
                                    {label[lang]}
                                </button>
                            ) : (
                                <Link href={href} onClick={onClose} className={className} aria-current={active ? "page" : undefined}>{label[lang]}</Link>
                            )}
                        </div>
                    );
                }

                if (disabled) {
                    return (
                        <span key={href} role="link" aria-disabled="true" className="block w-full cursor-not-allowed border-b border-white/10 border-l-2 border-l-transparent px-12 py-4 text-left font-medium tracking-wide text-text-muted uppercase opacity-60">
                            {label[lang]}
                        </span>
                    );
                }

                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`block w-full border-b border-white/10 border-l-2 px-12 py-4 text-left font-medium uppercase tracking-wide transition-colors duration-150 last:border-b-0
                                ${active
                                ? "border-l-midi-blue bg-midi-blue/10 font-bold text-midi-blue"
                                : "border-l-transparent bg-midi-black text-midi-white hover:bg-white/5 hover:text-midi-white"
                            }`}
                    >
                        {label[lang]}
                    </Link>
                );
            })}
            {participant && (
                <div className="px-8 py-2">
                    <Link href="/account" onClick={onClose}
                        aria-current={isCurrentPath(pathname, "/account") ? "page" : undefined}
                        className={`flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-base ${isCurrentPath(pathname, "/account") ? "bg-midi-blue/10 text-[#70cfff]" : "text-midi-gray hover:bg-white/5"}`}>
                        <UserRound aria-hidden="true" className="size-5" />
                        {lang === "lt" ? "Paskyros nustatymai" : "Account settings"}
                    </Link>
                    <SignOutButton redirectUrl="/">
                        <button type="button" onClick={onClose} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3 text-base text-text-muted hover:bg-white/5 hover:text-white">
                            <LogOut aria-hidden="true" className="size-5" />
                            {lang === "lt" ? "Atsijungti" : "Sign out"}
                        </button>
                    </SignOutButton>
                </div>
            )}
        </nav>

    );
}
