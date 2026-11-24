import { Lang } from "@/context/LanguageContext";

export const links = [
  { href: "/", label: { en: "Home", lt: "Pradžia" } },
  // COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER
  { href: "/dashboard/create", label: { en: "Create a meme", lt: "Kurti memą" } },
  { href: "/results", label: { en: "Results", lt: "Rezultatai" } },
  { href: "/rules", label: { en: "Rules", lt: "Taisyklės" } },
];

export const participantLinks = [
  { href: "/dashboard", label: { en: "Home", lt: "Pagrindinis" }, disabled: false },
  { href: "/dashboard/create", label: { en: "Create a meme", lt: "Kurti memą" }, disabled: false },
  { href: "/rules", label: { en: "Rules", lt: "Taisyklės" }, disabled: false },
];

type PageText = {
  titleTop: string;
  titleBottom: string;
  headerCenter: string;
};

export const text: Record<Lang, PageText> = {
  en: {
    titleTop: "MIDI",
    titleBottom: "MATHEMATICS AND INFORMATICS DAYS",
    headerCenter: "A Night with MIDI",
  },

  lt: {
    titleTop: "MIDI",
    titleBottom: "MATEMATIKŲ IR INFORMATIKŲ DIENOS",
    headerCenter: "Naktis su MIDI",
  },
};
