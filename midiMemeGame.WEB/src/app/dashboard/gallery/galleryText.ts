import type { Lang } from "@/context/LanguageContext";

type GalleryText = {
    eyebrow: string;
    title: string;
    description: string;
    loading: string;
    notStartedTitle: string;
    notStartedScheduled: string;
    notStartedUnscheduled: string;
    opensIn: string;
    opensAt: string;
    errorTitle: string;
    errorDescription: string;
    retry: string;
    loadErrorTitle: string;
    voteFailed: string;
    loadingPhoto: string;
    photoFailed: string;
    memeCount: (count: number) => string;
    emptyTitle: string;
    empty: string;
    showMore: string;
    yourVotes: string;
    votesLeft: (left: number) => string;
    allVotesUsed: string;
    vote: string;
    removeVote: string;
    voteLimit: string;
    ownMeme: string;
    ownMemeVote: string;
    yourVote: string;
    votesCount: (count: number) => string;
    by: string;
    fullRanking: string;
};

export const galleryText: Record<Lang, GalleryText> = {
    lt: {
        eyebrow: "Balsavimas",
        title: "Memų galerija",
        description: "Peržiūrėk visus balsavimui patvirtintus memus. Gali skirti iki trijų balsų skirtingiems memams — pasirink protingai.",
        loading: "Kraunami memai…",
        notStartedTitle: "Balsavimas dar neprasidėjo.",
        notStartedScheduled: "Galerija atsivers, kai prasidės balsavimas.",
        notStartedUnscheduled: "Balsavimo laikas dar nepaskelbtas.",
        opensIn: "Iki balsavimo liko",
        opensAt: "Balsavimo pradžia",
        errorTitle: "Nepavyko patikrinti balsavimo laiko.",
        errorDescription: "Patikrink ryšį ir bandyk dar kartą.",
        retry: "Bandyti dar kartą",
        loadErrorTitle: "Nepavyko įkelti memų.",
        voteFailed: "Nepavyko išsaugoti balso. Bandyk dar kartą.",
        loadingPhoto: "Kraunama…",
        photoFailed: "Nepavyko įkelti nuotraukos",
        memeCount: count => `${count} ${count % 10 === 1 && count % 100 !== 11 ? "memas" : count % 10 === 0 || (count % 100 >= 11 && count % 100 <= 19) ? "memų" : "memai"}`,
        emptyTitle: "Kol kas tuščia",
        empty: "Patvirtintų memų dar nėra.",
        showMore: "Rodyti daugiau",
        yourVotes: "Tavo balsai",
        votesLeft: left => `Liko ${left} ${left === 1 ? "balsas" : "balsai"}`,
        allVotesUsed: "Visi balsai panaudoti",
        vote: "Balsuoti",
        removeVote: "Atšaukti balsą",
        voteLimit: "Balsų nebeliko",
        ownMeme: "Tavo memas",
        ownMemeVote: "Už savo memą balsuoti negalima.",
        yourVote: "Tavo balsas",
        votesCount: count => `${count} ${count % 10 === 1 && count % 100 !== 11 ? "balsas" : count % 10 === 0 || (count % 100 >= 11 && count % 100 <= 19) ? "balsų" : "balsai"}`,
        by: "Autorius",
        fullRanking: "Visi memai",
    },
    en: {
        eyebrow: "Voting",
        title: "Meme gallery",
        description: "Browse every meme approved for voting. You can give up to three votes to different memes.",
        loading: "Loading memes…",
        notStartedTitle: "Voting has not started yet.",
        notStartedScheduled: "The gallery opens when voting begins.",
        notStartedUnscheduled: "The voting time has not been announced yet.",
        opensIn: "Voting opens in",
        opensAt: "Voting starts",
        errorTitle: "Couldn't check when voting opens.",
        errorDescription: "Check your connection and try again.",
        retry: "Try again",
        loadErrorTitle: "Couldn't load the memes.",
        voteFailed: "Couldn't save your vote. Please try again.",
        loadingPhoto: "Loading…",
        photoFailed: "Couldn't load photo",
        memeCount: count => `${count} ${count === 1 ? "meme" : "memes"}`,
        emptyTitle: "Nothing here yet",
        empty: "There are no approved memes yet.",
        showMore: "Show more",
        yourVotes: "Your votes",
        votesLeft: left => `${left} ${left === 1 ? "vote" : "votes"} left`,
        allVotesUsed: "All votes used",
        vote: "Vote",
        removeVote: "Remove vote",
        voteLimit: "No votes left",
        ownMeme: "Your meme",
        ownMemeVote: "You can’t vote for your own meme.",
        yourVote: "Your vote",
        votesCount: count => `${count} ${count === 1 ? "vote" : "votes"}`,
        by: "By",
        fullRanking: "All memes",
    },
};
