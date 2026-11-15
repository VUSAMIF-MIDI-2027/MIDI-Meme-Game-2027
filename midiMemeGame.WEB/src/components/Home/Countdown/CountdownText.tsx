import { Lang } from "@/context/LanguageContext";

type PageText = {
  days: string,
  hours: string,
  minutes: string,
  seconds: string
};

export const text: Record<Lang, PageText> = {
  en: {
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds"
  },

  lt: {
    days: "Dienos",
    hours: "Valandos",
    minutes: "Minutės",
    seconds: "Sekundės"
  },
};
