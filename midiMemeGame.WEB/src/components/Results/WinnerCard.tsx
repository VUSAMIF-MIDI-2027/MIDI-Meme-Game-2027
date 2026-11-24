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
    scoreLabel: string;
};

export function WinnerCard({ winner, placeLabel, imageAlt, fallbackLabel, scoreLabel }: WinnerCardProps) {
    return (
        <article className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-[#0a0a0a] ${winner.place === 1 ? "border-midi-blue" : "border-white/15"} ${PODIUM_POSITION[winner.place]}`}>
            <header className="flex items-center gap-2 px-3 py-3 md:gap-4 md:px-5 md:py-4">
                <Image
                    src={TROPHIES[winner.place]}
                    width={TROPHY_SIZE}
                    height={TROPHY_SIZE}
                    alt=""
                    className="size-8 shrink-0 select-none object-contain [image-rendering:pixelated] sm:size-10 md:size-14"
                />
                <div>
                    <p className="text-2xl leading-none font-extrabold text-[#18a9ec] md:text-4xl">0{winner.place}</p>
                    <p className="mt-1 text-[10px] leading-tight font-bold uppercase text-[#70cfff] md:text-xs md:tracking-widest">{placeLabel}</p>
                </div>
            </header>
            <figure className="flex flex-1 flex-col">
                <div className="relative aspect-[3/2]">
                    <ResultImage
                        src={winner.imageUrl}
                        alt={imageAlt}
                        fallbackLabel={fallbackLabel}
                        sizes={winner.place === 1
                            ? "(min-width: 1152px) 350px, (min-width: 768px) 33vw, (min-width: 400px) 352px, 90vw"
                            : "(min-width: 1152px) 350px, (min-width: 768px) 33vw, 45vw"}
                        priority={winner.place === 1}
                    />
                </div>
                <figcaption className="flex min-h-16 flex-1 items-center justify-center bg-white px-3 py-3 text-center text-sm leading-snug font-semibold wrap-anywhere text-black md:min-h-20 md:px-5 md:py-4 md:text-base">
                    {winner.caption}
                </figcaption>
            </figure>
            <footer className="flex flex-col items-start gap-1 px-3 py-3 md:flex-row md:items-center md:gap-3 md:px-5 md:py-4">
                {winner.userName && <p className="min-w-0 text-sm leading-snug font-bold wrap-anywhere text-midi-gray md:text-xl">{winner.userName}</p>}
                <span className="min-w-0 text-sm wrap-anywhere text-amber-200 tabular-nums md:ml-auto md:shrink-0">{scoreLabel}</span>
            </footer>
        </article>
    );
}
