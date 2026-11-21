import Image from "next/image";
import { podiumPosition, trophies } from "./podium";

type EmptyWinnerCardProps = {
    place: 1 | 2 | 3;
    placeLabel: string;
};

export function EmptyWinnerCard({ place, placeLabel }: EmptyWinnerCardProps) {
    return (
        <article
            aria-label={placeLabel}
            className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-dashed bg-[#050505] ${place === 1 ? "border-midi-blue/60" : "border-white/20"} ${podiumPosition[place]}`}
        >
            <header className="flex items-center gap-4 px-5 py-4">
                <Image
                    src={trophies[place]}
                    width={56}
                    height={56}
                    alt=""
                    className="size-14 shrink-0 select-none object-contain [image-rendering:pixelated]"
                />
                <div>
                    <p className="text-4xl leading-none font-extrabold text-[#18a9ec]">0{place}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#70cfff]">{placeLabel}</p>
                </div>
            </header>
            <div aria-hidden="true" className="aspect-[3/2] md:min-h-48" />
        </article>
    );
}
