"use client";

import Image from "next/image";

type PresentationMemeCardProps = {
    imageUrl: string | undefined;
    caption: string;
    photoMissingLabel: string;
};

export function PresentationMemeCard({ imageUrl, caption, photoMissingLabel }: PresentationMemeCardProps) {
    return (
        <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a]">
            <div className="relative aspect-[3/2] bg-white/5">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={caption}
                        fill
                        unoptimized
                        loading="eager"
                        decoding="sync"
                        sizes="(min-width: 2560px) 25vw, (min-width: 1920px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                    />
                ) : (
                    <span className="absolute inset-0 grid place-items-center px-4 text-center text-lg text-white/50 motion-safe:animate-pulse">
                        {photoMissingLabel}
                    </span>
                )}
            </div>
            <p className="flex min-h-28 flex-1 items-center justify-center bg-white px-6 py-5 text-center text-2xl leading-snug font-bold text-black xl:text-3xl 2xl:text-4xl">
                {caption}
            </p>
        </article>
    );
}
