import { Lang } from "@/context/LanguageContext";

export const links = [
  { href: "/", label: { en: "Home", lt: "Pradžia" } },
  // COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER
  { href: "/dashboard/create", label: { en: "Create a meme", lt: "Kurti memą" } },
  { href: "/results", label: { en: "Results", lt: "Rezultatai" } },
  { href: "/rules", label: { en: "Rules", lt: "Taisyklės" } },
];

// Enable these destinations when their separate page implementations are ready.
export const participantLinks = [
  { href: "/dashboard", label: { en: "Home", lt: "Pagrindinis" }, disabled: false, exact: true },
  { href: "/dashboard/create", label: { en: "Create a meme", lt: "Kurti memą" }, disabled: false, primary: true },
  { href: "/dashboard/gallery", label: { en: "Voting", lt: "Balsavimas" }, disabled: false, primary: true },
  { href: "/results", label: { en: "Results", lt: "Rezultatai" }, disabled: false, primary: true },
  { href: "/rules", label: { en: "Rules", lt: "Taisyklės" }, disabled: false },
];

type PageText = {
  titleTop: string;
  titleBottom: string;
};

export const text: Record<Lang, PageText> = {
  en: {
    titleTop: "MIDI",
    titleBottom: "MATHEMATICS AND INFORMATICS DAYS",
  },

  lt: {
    titleTop: "MIDI",
    titleBottom: "MATEMATIKŲ IR INFORMATIKŲ DIENOS",
  },
};
