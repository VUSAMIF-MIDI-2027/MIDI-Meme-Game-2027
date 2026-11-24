import type { Lang } from "@/context/LanguageContext";

type OverviewText = {
    title: string;
    reviewPending: string;
    metricsLabel: string;
    totalMemes: string;
    pendingApproval: string;
    approved: string;
    rejected: string;
    currentStage: string;
    defaultStage: string;
    topMemes: string;
    loadingMemes: string;
    noMemes: string;
    votes: string;
    viewAll: string
};

export const overviewText: Record<Lang, OverviewText> = {
    lt: {
        title: "Konkurso apžvalga",
        reviewPending: "Moderuoti memus",
        metricsLabel: "Konkurso rodikliai",
        totalMemes: "Iš viso memų",
        pendingApproval: "Laukia patvirtinimo",
        approved: "Patvirtinti",
        rejected: "Atmesti",
        currentStage: "Dabartinis etapas",
        defaultStage: "Iki renginio",
        topMemes: "Populiariausi memai pagal balsus",
        loadingMemes: "Kraunami populiariausi memai...",
        noMemes: "Nėra memų, kuriuos būtų galima parodyti.",
        votes: "balsų",
        viewAll: "Visi memai"
    },
    en: {
        title: "Competition overview",
        reviewPending: "Accept pending memes",
        metricsLabel: "Competition metrics",
        totalMemes: "Total memes",
        pendingApproval: "Pending approval",
        approved: "Approved",
        rejected: "Rejected",
        currentStage: "Current stage",
        defaultStage: "Until event",
        topMemes: "Top memes by votes",
        loadingMemes: "Loading top memes...",
        noMemes: "No memes to display.",
        votes: "votes",
        viewAll: "View all memes"
    },
};