"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { enUS, ltLT } from "./authLocalization";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function LocalizedClerkProvider({ children }: { children: ReactNode }) {
    const { lang } = useLanguage();

    if (!publishableKey) {
        throw new Error("Trūksta NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
    }

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            localization={lang === "lt" ? ltLT : enUS}
        >
            {children}
        </ClerkProvider>
    );
}
