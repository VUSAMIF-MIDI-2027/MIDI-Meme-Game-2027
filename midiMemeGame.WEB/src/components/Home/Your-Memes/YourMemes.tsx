"use client";

import { useLanguage } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import { yourMemesText } from "./yourMemesText";

export type MemeStatus = "approved" | "pending" | "rejected";

export type YourMeme = {
  id: number;
  image: string;
  imageAlt: string;
  caption: string;
  submittedAt: string;
  status: MemeStatus;
};

const statusStyles: Record<MemeStatus, string> = {
  approved: "text-green-400",
  pending: "text-amber-400",
  rejected: "text-red-400",
};

type YourMemesProps = {
  memes?: readonly YourMeme[];
};

const YourMemes = ({ memes = [] }: YourMemesProps) => {
  const { lang } = useLanguage();
  const t = yourMemesText[lang];
  const dateTimeFormatter = new Intl.DateTimeFormat(
    lang === "lt" ? "lt-LT" : "en-GB",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Vilnius",
    },
  );

  return (
    <section
      id="your-memes"
      aria-labelledby="your-memes-title"
      className="mt-14 scroll-mt-24 border-t border-white/15 pt-12 sm:mt-18 sm:pt-16 lg:mt-20 lg:pt-18"
    >
      <div>
        <div className="mb-7 sm:mb-9">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">
            {t.eyebrow}
          </p>
          <h2
            id="your-memes-title"
            className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl"
          >
            {t.title}
          </h2>
        </div>
        {memes.length === 0 ? (
          <div className="py-2">
            <h3 className="text-lg font-semibold text-midi-gray">
              {t.emptyTitle}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-muted">
              {t.empty}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {memes.map((meme) => (
              <MemeCard
                key={meme.id}
                image={meme.image}
                imageAlt={meme.imageAlt}
                caption={meme.caption}
                status={{
                  label: t.status[meme.status],
                  className: statusStyles[meme.status],
                }}
                layout="meta-footer"
                metaLabel={`${t.submitted} ${dateTimeFormatter.format(new Date(meme.submittedAt))}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default YourMemes;
