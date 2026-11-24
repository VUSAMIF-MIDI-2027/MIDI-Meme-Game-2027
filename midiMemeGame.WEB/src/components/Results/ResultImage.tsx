"use client";

import Image from "next/image";
import { useState } from "react";

type ResultImageProps = {
    src: string;
    alt: string;
    fallbackLabel: string;
    sizes: string;
    priority?: boolean;
};

export function ResultImage({ src, alt, fallbackLabel, sizes, priority = false }: ResultImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    if (!src || failedSrc === src) {
        return (
            <div role="img" aria-label={fallbackLabel} className="absolute inset-0 flex items-center justify-center bg-[#1d1d1d] text-sm font-bold tracking-widest text-text-muted">
                MIDI
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            priority={priority}
            sizes={sizes}
            className="object-cover"
            onError={() => setFailedSrc(src)}
        />
    );
}
