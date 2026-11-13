"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { enUS, ltLT } from "./authLocalization";

export function LocalizedClerkProvider({ children }: { children: ReactNode }) {
    const { lang } = useLanguage();

    return (
        <ClerkProvider localization={lang === "lt" ? ltLT : enUS}>
            {children}
        </ClerkProvider>
    );
}
