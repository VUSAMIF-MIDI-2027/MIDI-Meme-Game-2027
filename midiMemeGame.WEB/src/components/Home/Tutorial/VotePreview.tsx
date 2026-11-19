"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { Lang } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import type { DemoPhoto } from "./demoPhotos";

const voteText = {
  lt: {
    choose: "Rinktis šį memą",
    selected: "Pasirinkta · 1 taškas",
    hint: "Išbandyk balsavimą",
    note: "Tai pavyzdys — balsas neišsaugomas.",
  },
  en: {
    choose: "Choose this meme",
    selected: "Selected · 1 point",
    hint: "Try voting",
    note: "This is a preview — your vote is not saved.",
  },
};

type VoteCardProps = {
  photo: DemoPhoto;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
};

function VoteCard({ photo, lang, selected, onSelect }: VoteCardProps) {
  const t = voteText[lang];

  return (
    <MemeCard
      image={photo.image}
      imageAlt={photo.text[lang].alt}
      caption={photo.text[lang].caption}
      selected={selected}
      button={{
        label: selected ? t.selected : t.choose,
        ariaLabel: `${t.choose}: ${photo.text[lang].caption}`,
        pressed: selected,
        icon: (
          <Heart
            aria-hidden="true"
            className={`size-4 ${selected ? "fill-current" : ""}`}
          />
        ),
        onClick: onSelect,
      }}
    />
  );
}

type VotePreviewProps = {
  lang: Lang;
  photos: DemoPhoto[];
};

export default function VotePreview({ lang, photos }: VotePreviewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const t = voteText[lang];

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
        <Heart aria-hidden="true" className="size-4 text-midi-blue" />
        {t.hint}
        <span aria-live="polite">{selectedIds.length} / 3</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
        {photos.map((photo) => (
          <VoteCard
            key={photo.id}
            photo={photo}
            lang={lang}
            selected={selectedIds.includes(photo.id)}
            onSelect={() =>
              setSelectedIds(ids => ids.includes(photo.id)
                ? ids.filter(id => id !== photo.id)
                : ids.length < 3 ? [...ids, photo.id] : ids)
            }
          />
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-text-muted">{t.note}</p>
    </div>
  );
}
