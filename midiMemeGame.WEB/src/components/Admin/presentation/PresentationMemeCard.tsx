"use client";

import Image from "next/image";

type PresentationMemeCardProps = {
    imageUrl: string | undefined;
    caption: string;
};

export function PresentationMemeCard({ imageUrl, caption }: PresentationMemeCardProps) {
    return (
        <article className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a]">
            <div className="relative min-h-0 flex-1 bg-white/5">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={caption}
                        fill
                        unoptimized
                        loading="eager"
                        decoding="sync"
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                    />
                ) : (
                    <span aria-hidden="true" className="absolute inset-0 bg-white/10 motion-safe:animate-pulse" />
                )}
            </div>
            <p className="flex min-h-28 shrink-0 items-center justify-center bg-white px-6 py-5 text-center text-2xl leading-snug font-bold wrap-anywhere text-black xl:text-3xl 2xl:text-4xl">
                {caption}
            </p>
        </article>
    );
}
