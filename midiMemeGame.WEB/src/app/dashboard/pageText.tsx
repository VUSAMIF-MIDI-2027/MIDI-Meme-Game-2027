import type { Lang } from "@/context/LanguageContext";

type PageText = {
    miniTitle: string;
    title: string;
    description: string;
};

export const dashboardText: Record<Lang, PageText> = {
    lt: {
        miniTitle: "Iki pasimatymo renginyje",
        title: "Ačiū, kad susikūrei paskyrą!",
        description: "Savo paskyrą galėsi naudoti renginio metu. Šiuo metu dar ruošiame svetainę ir jos funkcijas. Iki pasimatymo „Naktyje su MIDI“!",
    },
    en: {
        miniTitle: "See you at the event",
        title: "Thanks for creating an account!",
        description: "You’ll be able to use your account during the event. We’re still preparing the website and its features. See you at Naktis su MIDI!",
    },
};
