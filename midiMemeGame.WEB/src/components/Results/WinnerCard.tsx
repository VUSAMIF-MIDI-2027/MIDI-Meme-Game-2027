"use client";

import Image from "next/image";
import { ResultImage } from "./ResultImage";
import { PODIUM_POSITION, TROPHIES, TROPHY_SIZE } from "./podium";
import type { Winner } from "@/services/resultsService";

type WinnerCardProps = {
    winner: Winner;
    placeLabel: string;
    imageAlt: string;
    fallbackLabel: string;
};

export function WinnerCard({ winner, placeLabel, imageAlt, fallbackLabel }: WinnerCardProps) {
    return (
        <article className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-[#0a0a0a] ${winner.place === 1 ? "border-midi-blue" : "border-white/15"} ${PODIUM_POSITION[winner.place]}`}>
            <header className="flex items-center gap-4 px-5 py-4">
                <Image
                    src={TROPHIES[winner.place]}
                    width={TROPHY_SIZE}
                    height={TROPHY_SIZE}
                    alt=""
                    className="size-14 shrink-0 select-none object-contain [image-rendering:pixelated]"
                />
                <div>
                    <p className="text-4xl leading-none font-extrabold text-[#18a9ec]">0{winner.place}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#70cfff]">{placeLabel}</p>
                </div>
            </header>
            <figure className="flex flex-1 flex-col">
                <div className="relative aspect-[3/2]">
                    <ResultImage
                        src={winner.imageUrl}
                        alt={imageAlt}
                        fallbackLabel={fallbackLabel}
                        sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 90vw"
                        priority={winner.place === 1}
                    />
                </div>
                <figcaption className="flex min-h-20 flex-1 items-center justify-center bg-white px-5 py-4 text-center text-base font-semibold leading-snug text-black">
                    {winner.caption}
                </figcaption>
            </figure>
            {winner.userName && <p className="px-5 py-4 text-xl font-bold text-midi-gray">{winner.userName}</p>}
        </article>
    );
}
