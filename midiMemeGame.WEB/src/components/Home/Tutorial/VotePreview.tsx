"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Lang } from "@/context/LanguageContext";
import type { DemoPhoto } from "./demoPhotos";

const voteText = {
    lt: { choose: "Rinktis šį memą", selected: "Tavo favoritas", hint: "Išbandyk balsavimą", note: "Tai pavyzdys — balsas neišsaugomas." },
    en: { choose: "Choose this meme", selected: "Your favourite", hint: "Try voting", note: "This is a preview — your vote is not saved." },
};

type VoteCardProps = {
    photo: DemoPhoto;
    lang: Lang;
    selected: boolean;
    onSelect: () => void;
};

function VoteCard({ photo, lang, selected, onSelect }: VoteCardProps) {
    const t = voteText[lang];
    const borderStyle = selected ? "border-midi-blue" : "border-white/15";
    const buttonStyle = selected
        ? "border-midi-blue bg-midi-blue text-white"
        : "border-white/20 bg-transparent text-white/80 hover:border-midi-blue hover:text-white";

    return (
        <article className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-[#0a0a0a] transition-colors ${borderStyle}`}>
            <figure className="flex flex-1 flex-col">
                <div className="relative aspect-[3/2]">
                    <Image
                        src={photo.image}
                        alt={photo.text[lang].alt}
                        fill
                        loading="eager"
                        sizes="(min-width: 1024px) 360px, (min-width: 480px) 440px, 90vw"
                        className="object-cover"
                    />
                </div>
                <figcaption className="flex min-h-20 flex-1 items-center justify-center bg-white px-5 py-4 text-center text-base font-semibold leading-snug text-black">
                    {photo.text[lang].caption}
                </figcaption>
            </figure>
            <div className="p-3">
                <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${t.choose}: ${photo.text[lang].caption}`}
                    onClick={onSelect}
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midi-blue ${buttonStyle}`}
                >
                    <Heart aria-hidden="true" className={`size-4 ${selected ? "fill-current" : ""}`} />
                    {selected ? t.selected : t.choose}
                </button>
            </div>
        </article>
    );
}

type VotePreviewProps = {
    lang: Lang;
    photos: DemoPhoto[];
};

export default function VotePreview({ lang, photos }: VotePreviewProps) {
    const [favouriteId, setFavouriteId] = useState<string | null>(null);
    const t = voteText[lang];

    return (
        <div>
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                <Heart aria-hidden="true" className="size-4 text-midi-blue" />
                {t.hint}
            </div>
            <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
                {photos.map((photo) => (
                    <VoteCard
                        key={photo.id}
                        photo={photo}
                        lang={lang}
                        selected={favouriteId === photo.id}
                        onSelect={() => setFavouriteId(favouriteId === photo.id ? null : photo.id)}
                    />
                ))}
            </div>
            <p className="mt-5 text-center text-xs text-text-muted">{t.note}</p>
        </div>
    );
}
