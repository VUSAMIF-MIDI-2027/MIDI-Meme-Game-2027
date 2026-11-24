import { Lang } from "@/context/LanguageContext";

export const links = [
  { href: "/", label: { en: "Home", lt: "Pradžia" } },
  // COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER
  { href: "/login", label: { en: "Create a meme", lt: "Kurti memą" } },
  { href: "/results", label: { en: "Results", lt: "Rezultatai" } },
  { href: "/rules", label: { en: "Rules", lt: "Taisyklės" } },
];

// Enable these destinations when their separate page implementations are ready.
export const participantLinks = [
  { href: "/dashboard", label: { en: "Home", lt: "Pagrindinis" }, disabled: false },
  { href: "/photos", label: { en: "Create a meme", lt: "Kurti memą" }, disabled: true, primary: true },
  { href: "/dashboard/gallery", label: { en: "Voting", lt: "Balsavimas" }, disabled: false, primary: true },
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
