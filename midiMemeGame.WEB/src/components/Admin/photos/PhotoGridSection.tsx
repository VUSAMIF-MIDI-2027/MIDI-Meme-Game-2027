"use client";

import type { AdminPhoto } from "@/services/adminService";
import PhotoCard from "./PhotoCard";

type BadgeVariant = "enabled" | "disabled";

type PhotoGridSectionProps = {
    heading: string;
    emptyText: string;
    photos: AdminPhoto[];
    variant: BadgeVariant;
    getToken: () => Promise<string | null>;
    onToggleEnabled: (photoId: number, nextEnabled: boolean) => Promise<void>;
};

const BADGE_CLASSES: Record<BadgeVariant, string> = {
    enabled: "bg-emerald-500/10 text-emerald-400",
    disabled: "bg-amber-500/10 text-amber-300",
};

export function PhotoGridSection({
    heading,
    emptyText,
    photos,
    variant,
    getToken,
    onToggleEnabled,
}: PhotoGridSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{heading}</h2>
                <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums ${BADGE_CLASSES[variant]}`}
                >
                    {photos.length}
                </span>
            </div>

            {photos.length === 0 ? (
                <p className="text-sm text-white/55">{emptyText}</p>
            ) : (
                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo) => (
                        <li
                            key={photo.id}
                            className="overflow-hidden rounded-xl border border-white/10 bg-[#11161a]"
                        >
                            <PhotoCard
                                photo={photo}
                                getToken={getToken}
                                onToggleEnabled={onToggleEnabled}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}