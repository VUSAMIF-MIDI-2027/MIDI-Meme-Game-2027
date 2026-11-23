import type { Lang } from "@/context/LanguageContext";

type MemeApprovalText = {
    pendingTab: string;
    approvedTab: string;
    rejectedTab: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    photoIdLabel: string;
    submittedLabel: string;
    invalidatedWarning: string;
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    loading: string;
    emptyPending: string;
    emptyApproved: string;
    emptyRejected: string;
    loadError: string;
    actionError: string;
    photoFallbackAlt: string;
};

export const memeApprovalText: Record<Lang, MemeApprovalText> = {
    lt: {
        pendingTab: "Laukia patvirtinimo",
        approvedTab: "Patvirtinti",
        rejectedTab: "Atmesti",
        statusPending: "Laukia peržiūros",
        statusApproved: "Patvirtintas",
        statusRejected: "Atmestas",
        photoIdLabel: "Nuotrauka #",
        submittedLabel: "Pateikta",
        invalidatedWarning: "Šaltinio nuotrauka išjungta",
        approve: "Patvirtinti",
        approving: "Tvirtinama…",
        reject: "Atmesti",
        rejecting: "Atmetama…",
        loading: "Kraunami memai…",
        emptyPending: "Šiuo metu nėra memų, laukiančių patvirtinimo.",
        emptyApproved: "Kol kas nėra patvirtintų memų.",
        emptyRejected: "Kol kas nėra atmestų memų.",
        loadError: "Nepavyko įkelti memų sąrašo.",
        actionError: "Nepavyko atnaujinti memo būsenos. Bandyk dar kartą.",
        photoFallbackAlt: "Konkurso nuotrauka memui",
    },
    en: {
        pendingTab: "Pending approval",
        approvedTab: "Approved",
        rejectedTab: "Rejected",
        statusPending: "Pending review",
        statusApproved: "Approved",
        statusRejected: "Rejected",
        photoIdLabel: "Photo #",
        submittedLabel: "Submitted",
        invalidatedWarning: "Source photo disabled",
        approve: "Approve",
        approving: "Approving…",
        reject: "Reject",
        rejecting: "Rejecting…",
        loading: "Loading memes…",
        emptyPending: "There are no memes pending approval.",
        emptyApproved: "No approved memes yet.",
        emptyRejected: "No rejected memes yet.",
        loadError: "Failed to load memes.",
        actionError: "Failed to update meme status. Please try again.",
        photoFallbackAlt: "Competition meme photo",
    },
};