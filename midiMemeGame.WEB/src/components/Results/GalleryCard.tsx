"use client";

import { ResultImage } from "./ResultImage";
import type { ResultMeme } from "@/services/resultsService";

type GalleryCardProps = {
    meme: ResultMeme;
    imageAlt: string;
    fallbackLabel: string;
};

export function GalleryCard({ meme, imageAlt, fallbackLabel }: GalleryCardProps) {
    return (
        <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0a0a0a]">
            <figure className="flex flex-1 flex-col">
                <div className="relative aspect-[3/2]">
                    <ResultImage
                        src={meme.imageUrl}
                        alt={imageAlt}
                        fallbackLabel={fallbackLabel}
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 90vw"
                    />
                </div>
                <figcaption className="flex min-h-20 flex-1 items-center justify-center bg-white px-5 py-4 text-center text-base font-semibold leading-snug text-black">
                    {meme.caption}
                </figcaption>
            </figure>
            {meme.userName && <p className="p-3 text-xs font-semibold uppercase tracking-widest text-text-muted">{meme.userName}</p>}
        </article>
    );
}
