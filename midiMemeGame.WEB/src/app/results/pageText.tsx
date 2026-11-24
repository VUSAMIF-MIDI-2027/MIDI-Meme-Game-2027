import type { Lang } from "@/context/LanguageContext";

type PageText = {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    ongoingTitle: string;
    ongoing: string;
    unpublishedTitle: string;
    unpublished: string;
    publishedEmpty: string;
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

    error: string;
    retry: string;
    memeAlt: string;
    imageUnavailable: string;
    points: (score: number) => string;
};

const ltPointForms = new Intl.PluralRules("lt");
const ltPointCount = new Intl.NumberFormat("lt");
const enPointCount = new Intl.NumberFormat("en");

export const text: Record<Lang, PageText> = {
    lt: {
        eyebrow: "NAKTIS SU MIDI",
        title: "Memų konkurso",
        titleAccent: "rezultatai",
        intro: "Susipažink su šių metų nugalėtojais ir kitais konkurso memais.",
        ongoingTitle: "Renginys dar vyksta",
        ongoing: "Rezultatai bus rodomi čia, kai tik renginys baigsis ir organizatoriai juos paskelbs.",
        unpublishedTitle: "Renginys baigėsi",
        unpublished: "Rezultatai tuojau bus paskelbti.",
        publishedEmpty: "Paskelbtuose rezultatuose memų nėra.",
        winnersEyebrow: "Šių metų geriausieji",
        winnersTitle: "Nugalėtojai",
        places: ["Pirma vieta", "Antra vieta", "Trečia vieta"],
        galleryEyebrow: "Daugiau konkurso favoritų",
        galleryTitle: "Kiti konkurso memai",
        galleryEmpty: "Kitų konkurso memų nėra.",
        loadMore: "Rodyti daugiau",
        loadingMore: "Kraunami kiti memai…",
        loadMoreError: "Nepavyko įkelti daugiau memų.",
        loading: "Kraunami rezultatai…",
        error: "Nepavyko įkelti rezultatų.",
        retry: "Bandyti dar kartą",
        memeAlt: "Memas",
        imageUnavailable: "Nuotrauka nepasiekiama",
        points: score => {
            const form = ltPointForms.select(score);
            const unit = form === "one" ? "taškas" : form === "few" ? "taškai" : "taškų";
            return ltPointCount.format(score) + " " + unit;
        },
    },
    en: {
        eyebrow: "NAKTIS SU MIDI",
        title: "Meme competition",
        titleAccent: "results",
        intro: "Meet this year's winners and the other memes from the competition.",
        ongoingTitle: "The event is still in progress",
        ongoing: "The results will appear here once the event has ended and the organisers have published them.",
        unpublishedTitle: "The event has ended",
        unpublished: "The results will be published shortly.",
        publishedEmpty: "There are no memes in the published results.",
        winnersEyebrow: "This year's best",
        winnersTitle: "Winners",
        places: ["First place", "Second place", "Third place"],
        galleryEyebrow: "More competition favourites",
        galleryTitle: "Other competition memes",
        galleryEmpty: "There are no other competition memes.",
        loadMore: "Show more",
        loadingMore: "Loading more memes…",
        loadMoreError: "Could not load more memes.",
        loading: "Loading the results…",
        error: "Could not load the results.",
        retry: "Try again",
        memeAlt: "Meme",
        imageUnavailable: "Image unavailable",
        points: score => enPointCount.format(score) + (score === 1 ? " point" : " points"),
    },
};
