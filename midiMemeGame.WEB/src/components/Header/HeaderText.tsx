import { Lang } from "@/context/LanguageContext";

export const links = [
  { href: "/", label: { en: "Home", lt: "Pagrindinis" } },
  // COMMENTED OUT SO AS TO EASILY ADD IF ANY NEEDED LATER
  // { href: "/contacts", label: { en: "Contacts", lt: "Kontaktai" } },
  // { href: "/activities", label: { en: "Activities", lt: "Veiklos" } },
  // { href: "/archives", label: { en: "Archives", lt: "Archyvai" } },
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
