"use client";

import { Lang, useLanguage } from "@/context/LanguageContext";

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  const languages : Lang[] = ["en", "lt"];

  return (
    <div role="group" aria-label={lang === "lt" ? "Kalba" : "Language"} className={`inline-flex shrink-0 items-center gap-1.5 ${compact ? "" : "ml-2 min-h-8 border-l border-midi-charcoal pl-4"}`}>
      {languages.map((language, index) => (
        <span
          key={language}
          className="inline-flex items-center gap-1.5"
        >
          {index > 0 && (
            <span className="select-none text-[13px] font-light leading-none text-[#dcdcdc]">
              /
            </span>
          )}

          <button
            type="button"
            aria-pressed={lang === language}
            aria-label={language === "lt" ? "Lietuvių" : "English"}
            onClick={() => setLang(language)}
            className={`${compact ? "min-h-7 text-[11px]" : "min-h-9 text-[13px]"} px-0.5 uppercase tracking-[0.12em] leading-none transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-midi-blue
              ${
                lang === language
                  ? "cursor-default font-extrabold text-midi-blue opacity-100"
                  : "cursor-pointer font-normal text-midi-gray opacity-40 hover:opacity-75"
              }
            `}
          >
            {language.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
