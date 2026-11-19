"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isCurrentPath } from "@/components/Header/isCurrentPath";

export function AccountMenu() {
    const { lang } = useLanguage();
    const active = isCurrentPath(usePathname(), "/account");

    return (
        <div className="flex items-center">
            <Link href="/account" aria-current={active ? "page" : undefined}
                aria-label={lang === "lt" ? "Paskyros nustatymai" : "Account settings"}
                title={lang === "lt" ? "Paskyros nustatymai" : "Account settings"}
                className={`inline-flex min-h-10 items-center gap-2 border-b-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${active ? "border-midi-blue text-[#70cfff]" : "border-transparent text-text-muted hover:text-white"}`}>
                <UserRound aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{lang === "lt" ? "Paskyra" : "Account"}</span>
            </Link>
        </div>
    );
}
