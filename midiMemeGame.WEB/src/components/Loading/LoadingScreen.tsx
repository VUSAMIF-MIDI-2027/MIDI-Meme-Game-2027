"use client";

import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { loadingText } from "./pageText";

type LoadingScreenProps = {
    message?: "loading" | "preparingAccount";
    overlay?: boolean;
};

export function LoadingScreen({ message = "loading", overlay = false }: LoadingScreenProps) {
    const { lang } = useLanguage();
    const t = loadingText[lang];
    const layout = overlay
        ? "fixed inset-x-0 bottom-0 top-17 z-40"
        : "min-h-[calc(100svh-4.25rem)] flex-1";

    return (
        <div role="status" aria-live="polite" className={`${layout} flex flex-col items-center justify-center gap-5 bg-page-background px-6 py-12 text-center text-white`}>
            <LoaderCircle aria-hidden="true" className="size-8 text-[#70cfff] motion-safe:animate-spin" />
            <span className="sr-only">{t[message]}</span>
        </div>
    );
}
