import type { Lang } from "@/context/LanguageContext";

type HowItWorksText = {
    eyebrow: string;
    title: string;
    descriptions: [string, string, string, string];
    votePreviewLabel: string;
    choosePhotoHint: string;
    submitted: string;

};

export const howItWorksText: Record<Lang, HowItWorksText> = {
    lt: {
        eyebrow: "Kaip tai veikia?",
        title: "Viena nuotrauka. Keturi paprasti žingsniai.",
        descriptions: [
            "Išsirink organizatorių įkeltą renginio kadrą.",
            "Pridėk vieną trumpą ir juokingą sakinį.",
            "Patvirtink rezultatą ir dalyvauk konkurse.",
            "Peržiūrėk dalyvių memus ir balsuok už geriausią.",
        ],

        choosePhotoHint: "Išbandyk — pasirink nuotrauką",
        submitted: "Memas pateiktas!",
        votePreviewLabel: "Tavo favoritas · balsavimo pavyzdys",
    },
    en: {
        eyebrow: "How does it work?",
        title: "One photo. Four simple steps.",
        descriptions: [
            "Choose an event photo uploaded by the organisers.",
            "Add one short, funny sentence.",
            "Confirm your meme and enter the competition.",
            "Browse the entries and vote for the best meme.",
        ],

        choosePhotoHint: "Try it — choose a photo",
        submitted: "Meme submitted!",
        votePreviewLabel: "Your favourite · voting preview",
    },
};
