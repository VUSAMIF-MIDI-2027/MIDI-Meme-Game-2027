"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileMenuProps = {
    menuOpen: boolean;
    links: NavLink[];
    onClose: () => void;
}

type NavLink = {
    href: string;
    label: labelLang;
}

type labelLang = {
    en: string;
    lt: string;
}

export function MobileMenu({
    menuOpen,
    links,
    onClose,
}: MobileMenuProps) {
    const pathname = usePathname();
    const { lang } = useLanguage();

    return (
        <nav
            className={`fixed top-17 left-0 right-0 z-40 overflow-hidden bg-midi-black transition-all duration-300 min-[1100px]:hidden
                    ${menuOpen
                    ? "max-h-80 border-b border-white/10 shadow-xl shadow-black/40"
                    : "max-h-0 border-b-0 shadow-none"
                }`}
        >
            {links.map(({ href, label }) => {
                const normalize = (path: string) => path === "/" ? "/" : path.replace(/\/+$/, "");
                const active = normalize(pathname) === normalize(href);

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
        </nav>

    );
}
