import type { Lang } from "@/context/LanguageContext";

type PageText = {
    loading: string;
    preparingAccount: string;
    description: string;
};

export const loadingText: Record<Lang, PageText> = {
    lt: {
        loading: "Kraunama…",
        preparingAccount: "Ruošiame tavo paskyrą…",
        description: "Dar akimirka ir galėsime tęsti.",
    },
    en: {
        loading: "Loading…",
        preparingAccount: "Preparing your account…",
        description: "Just a moment, we’ll be ready shortly.",
    },
};
