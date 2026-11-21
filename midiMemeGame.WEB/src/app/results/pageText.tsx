import type { Lang } from "@/context/LanguageContext";

type PageText = {
    eyebrow: string;
    title: string;
    intro: string;
    winnersEyebrow: string;
    winnersTitle: string;
    places: [string, string, string];
    galleryEyebrow: string;
    galleryTitle: string;
    galleryEmpty: string;
    loadMore: string;
    loadingMore: string;
    loadMoreError: string;
    loading: string;
    emptyPodium: string;
    galleryEmptyTitle: string;
    error: string;
    galleryError: string;
    retry: string;
    memeAlt: string;
    imageUnavailable: string;
};

export const text: Record<Lang, PageText> = {
    lt: {
        eyebrow: "NAKTIS SU MIDI",
        title: "Memų konkurso rezultatai",
        intro: "Susipažink su šių metų nugalėtojais ir organizatorių atrinktais memais.",
        winnersEyebrow: "Šių metų geriausieji",
        winnersTitle: "Nugalėtojai",
        places: ["Pirma vieta", "Antra vieta", "Trečia vieta"],
        galleryEyebrow: "Daugiau konkurso favoritų",
        galleryTitle: "Kiti organizatorių atrinkti memai",
        galleryEmptyTitle: "Kol kas nieko nepaskelbta",
        galleryEmpty: "Organizatorių atrinkti memai čia pasirodys vos tik bus paskelbti.",
        loadMore: "Rodyti daugiau",
        loadingMore: "Kraunama…",
        loadMoreError: "Nepavyko įkelti daugiau memų.",
        loading: "Kraunami rezultatai…",
        emptyPodium: "Prizinės vietos dar nepaskelbtos",
        error: "Nepavyko įkelti rezultatų.",
        galleryError: "Nepavyko įkelti atrinktų memų.",
        retry: "Bandyti dar kartą",
        memeAlt: "Memas",
        imageUnavailable: "Nuotrauka nepasiekiama",
    },
    en: {
        eyebrow: "NAKTIS SU MIDI",
        title: "Meme competition results",
        intro: "Meet this year's winners and the memes selected by the organisers.",
        winnersEyebrow: "This year's best",
        winnersTitle: "Winners",
        places: ["First place", "Second place", "Third place"],
        galleryEyebrow: "More competition favourites",
        galleryTitle: "Other memes selected by the organisers",
        galleryEmptyTitle: "Nothing published yet",
        galleryEmpty: "The memes selected by the organisers will appear here once they are published.",
        loadMore: "Show more",
        loadingMore: "Loading…",
        loadMoreError: "Could not load more memes.",
        loading: "Loading the results…",
        emptyPodium: "The winning places have not been published yet",
        error: "Could not load the results.",
        galleryError: "Could not load the selected memes.",
        retry: "Try again",
        memeAlt: "Meme",
        imageUnavailable: "Image unavailable",
    },
};
