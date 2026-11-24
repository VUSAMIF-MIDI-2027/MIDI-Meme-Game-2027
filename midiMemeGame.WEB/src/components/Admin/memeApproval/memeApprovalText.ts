import type { Lang } from "@/context/LanguageContext";

type MemeApprovalText = {
    pendingTab: string;
    approvedTab: string;
    rejectedTab: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    deletedByAuthor: string;
    showDeletedPreview: string;
    hideDeletedPreview: string;
    photoIdLabel: string;
    submittedLabel: string;
    authorLabel: string;
    authorEmailLabel: string;
    invalidatedWarning: string;
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    loading: string;
    emptyPending: string;
    emptyApproved: string;
    emptyRejected: string;
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
        deletedByAuthor: "Autorius ištrynė",
        showDeletedPreview: "Rodyti memą",
        hideDeletedPreview: "Slėpti memą",
        photoIdLabel: "Nuotrauka #",
        submittedLabel: "Pateikta",
        authorLabel: "Sukūrė",
        authorEmailLabel: "El. paštas",
        invalidatedWarning: "Šaltinio nuotrauka išjungta",
        approve: "Patvirtinti",
        approving: "Tvirtinama…",
        reject: "Atmesti",
        rejecting: "Atmetama…",
        loading: "Kraunami memai…",
        emptyPending: "Šiuo metu nėra memų, laukiančių patvirtinimo.",
        emptyApproved: "Kol kas nėra patvirtintų memų.",
        emptyRejected: "Kol kas nėra atmestų memų.",
        photoFallbackAlt: "Konkurso nuotrauka memui",
    },
    en: {
        pendingTab: "Pending approval",
        approvedTab: "Approved",
        rejectedTab: "Rejected",
        statusPending: "Pending review",
        statusApproved: "Approved",
        statusRejected: "Rejected",
        deletedByAuthor: "Deleted by author",
        showDeletedPreview: "Show meme",
        hideDeletedPreview: "Hide meme",
        photoIdLabel: "Photo #",
        submittedLabel: "Submitted",
        authorLabel: "Created by",
        authorEmailLabel: "Email",
        invalidatedWarning: "Source photo disabled",
        approve: "Approve",
        approving: "Approving…",
        reject: "Reject",
        rejecting: "Rejecting…",
        loading: "Loading memes…",
        emptyPending: "There are no memes pending approval.",
        emptyApproved: "No approved memes yet.",
        emptyRejected: "No rejected memes yet.",
        photoFallbackAlt: "Competition meme photo",
    },
};