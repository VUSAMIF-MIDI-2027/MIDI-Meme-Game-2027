import { Lang } from "@/context/LanguageContext";

type PageText = {
  text1: string;
  text2: string;
};

export const text: Record<Lang, PageText> = {
  en: {
    text1: "Smaple text 1",
    text2: "Sample text 2"
  },

  lt: {
    text1: "Bandomasis tekstas 1",
    text2: "Bandomasis tekstas 2"
  },
};