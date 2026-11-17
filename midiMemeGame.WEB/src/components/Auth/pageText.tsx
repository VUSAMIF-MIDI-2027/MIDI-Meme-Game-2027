import type { Lang } from "@/context/LanguageContext";

type PageText = {
    syncFailed: string;
    retry: string;
    signOut: string;
};

export const accountText: Record<Lang, PageText> = {
    lt: {
        syncFailed: "Nepavyko paruošti tavo paskyros. Pabandyk dar kartą.",
        retry: "Bandyti dar kartą",
        signOut: "Atsijungti",
    },
    en: {
        syncFailed: "We couldn't prepare your account. Please try again.",
        retry: "Try again",
        signOut: "Sign out",
    },
};
