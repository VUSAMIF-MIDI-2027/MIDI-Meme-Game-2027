import type { Lang } from "@/context/LanguageContext";

type HowItWorksText = {
    eyebrow: string;
    title: string;
    descriptions: [string, string, string];
    choosePhotoHint: string;
    submitted: string;

};

export const howItWorksText: Record<Lang, HowItWorksText> = {
    lt: {
        eyebrow: "Kaip tai veikia?",
        title: "Viena nuotrauka. Trys paprasti žingsniai.",
        descriptions: [
            "Išsirink organizatorių įkeltą renginio kadrą.",
            "Pridėk vieną trumpą ir juokingą sakinį.",
            "Patvirtink rezultatą ir dalyvauk konkurse.",
        ],

        choosePhotoHint: "Išbandyk — pasirink nuotrauką",
        submitted: "Memas pateiktas!",
    },
    en: {
        eyebrow: "How does it work?",
        title: "One photo. Three simple steps.",
        descriptions: [
            "Choose an event photo uploaded by the organisers.",
            "Add one short, funny sentence.",
            "Confirm your meme and enter the competition.",
        ],

        choosePhotoHint: "Try it — choose a photo",
        submitted: "Meme submitted!",
    },
};
