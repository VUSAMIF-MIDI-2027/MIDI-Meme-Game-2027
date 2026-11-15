import Image, { type StaticImageData } from "next/image";
import { Check } from "lucide-react";

type StepPreviewProps = {
    step: number;
    photo: StaticImageData;
    caption: string;
    submitted: string;
    photoAlt: string;
};

export default function MemePreview({ step, photo, caption, submitted, photoAlt }: StepPreviewProps) {
    const isSubmitted = step === 3;

    return (
        <div className={isSubmitted
            ? "relative grid aspect-[4/3] grid-rows-[minmax(0,1fr)_auto] justify-items-center gap-4 overflow-hidden rounded-xl border border-white/15 bg-[#0a0a0a] px-7 pt-6 pb-4"
            : "aspect-[4/3] overflow-hidden rounded-xl border border-white/15"}>
            <figure className={isSubmitted
                ? "flex h-full min-h-0 w-[86%] -rotate-3 flex-col"
                : "flex h-full w-full flex-col"}>
                <div className="relative min-h-0 flex-1">
                    <Image
                        src={photo}
                        alt={photoAlt}
                        fill
                        loading="eager"
                        sizes="(min-width: 768px) 360px, (min-width: 480px) 440px, 90vw"
                        className="object-cover object-center"
                    />
                </div>
                <figcaption className={isSubmitted
                    ? "shrink-0 rounded-b-sm bg-white px-2 py-2 text-center text-[10px] font-semibold leading-tight text-black"
                    : "flex min-h-16 shrink-0 items-center justify-center bg-white px-5 py-3 text-center text-sm font-semibold leading-snug text-black"}>
                    {caption}
                </figcaption>
            </figure>
            {isSubmitted && (
                <>
                    <span className="absolute top-4 right-4 rounded-full border-4 border-[#0a0a0a] bg-midi-blue p-2 text-white">
                        <Check aria-hidden="true" className="size-5" />
                    </span>
                    <p className="text-center text-base font-bold leading-normal">{submitted}</p>
                </>
            )}
        </div>
    );
}

