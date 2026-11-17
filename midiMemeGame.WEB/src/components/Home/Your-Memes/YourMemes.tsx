"use client";

import { useLanguage } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import { ui } from "@/styles/ui";
import { yourMemes, type MemeStatus } from "./yourMemesMock";
import { yourMemesText } from "./yourMemesText";

const statusStyles: Record<MemeStatus, string> = {
  approved: "text-green-400",
  pending: "text-amber-400",
  rejected: "text-red-400",
};

const YourMemes = () => {
  const { lang } = useLanguage();
  const t = yourMemesText[lang];
  const dateTimeFormatter = new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <section
      id="your-memes"
      aria-labelledby="your-memes-title"
      className="scroll-mt-17 bg-black px-5 py-16 sm:px-6 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-xl text-center lg:mb-12">
          <h2
            id="your-memes-title"
            className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
          >
            {t.title}
          </h2>
          <p className={`${ui.description} mt-4`}>
            {yourMemes.length === 0 ? t.empty : t.description}
          </p>
        </div>
        {yourMemes.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {yourMemes.map((meme) => (
              <MemeCard
                key={meme.id}
                image={meme.image}
                imageAlt={meme.text[lang].alt}
                caption={meme.text[lang].caption}
                status={{
                  label: t.status[meme.status],
                  className: statusStyles[meme.status],
                }}
                metaLabel={dateTimeFormatter.format(new Date(meme.submittedAt))}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default YourMemes;
