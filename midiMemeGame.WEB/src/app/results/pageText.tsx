import type { Lang } from "@/context/LanguageContext";

type PageText = {
    eyebrow: string;
    title: string;
    intro: string;
    ongoingTitle: string;
    ongoing: string;
    winnersEyebrow: string;
    winnersTitle: string;
    places: [string, string, string];
    galleryEyebrow: string;
    galleryTitle: string;
    galleryEmptyTitle: string;
    galleryEmpty: string;
    loadMore: string;
    loading: string;
    emptyPodium: string;
    error: string;
    retry: string;
    memeAlt: string;
    imageUnavailable: string;
};

export const text: Record<Lang, PageText> = {
    lt: {
        eyebrow: "NAKTIS SU MIDI",
        title: "Memų konkurso rezultatai",
        intro: "Susipažink su šių metų nugalėtojais ir kitais konkurso memais.",
        ongoingTitle: "Renginys dar vyksta",
        ongoing: "Rezultatai bus rodomi čia, kai tik renginys baigsis ir organizatoriai juos paskelbs.",
        winnersEyebrow: "Šių metų geriausieji",
        winnersTitle: "Nugalėtojai",
        places: ["Pirma vieta", "Antra vieta", "Trečia vieta"],
        galleryEyebrow: "Daugiau konkurso favoritų",
        galleryTitle: "Kiti konkurso memai",
        galleryEmptyTitle: "Kol kas nieko nepaskelbta",
        galleryEmpty: "Kiti memai čia pasirodys vos tik bus paskelbti.",
        loadMore: "Rodyti daugiau",
        loading: "Kraunami rezultatai…",
        emptyPodium: "Prizinės vietos dar nepaskelbtos",
        error: "Nepavyko įkelti rezultatų.",
        retry: "Bandyti dar kartą",
        memeAlt: "Memas",
        imageUnavailable: "Nuotrauka nepasiekiama",
    },
    en: {
        eyebrow: "NAKTIS SU MIDI",
        title: "Meme competition results",
        intro: "Meet this year's winners and the other memes from the competition.",
        ongoingTitle: "The event is still in progress",
        ongoing: "The results will appear here once the event has ended and the organisers have published them.",
        winnersEyebrow: "This year's best",
        winnersTitle: "Winners",
        places: ["First place", "Second place", "Third place"],
        galleryEyebrow: "More competition favourites",
        galleryTitle: "Other competition memes",
        galleryEmptyTitle: "Nothing published yet",
        galleryEmpty: "The other memes will appear here once they are published.",
        loadMore: "Show more",
        loading: "Loading the results…",
        emptyPodium: "The winning places have not been published yet",
        error: "Could not load the results.",
        retry: "Try again",
        memeAlt: "Meme",
        imageUnavailable: "Image unavailable",
    },
};
