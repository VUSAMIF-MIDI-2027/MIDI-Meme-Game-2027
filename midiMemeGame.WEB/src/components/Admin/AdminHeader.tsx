"use client";

import { SECTIONS, type AdminTranslations, type Section } from "@/app/admin/types";

type AdminHeaderProps = {
    t: AdminTranslations;
    title: string;
    description: string;
};

export function AdminHeader({ t, title, description }: AdminHeaderProps) {
    return (
        <header className="mb-6 lg:mb-12 lg:border-b lg:border-white/10 lg:pb-8">
            <p className="text-xs font-bold tracking-[0.18em] text-midi-blue uppercase">
                {t.label}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
                {description}
            </p>
        </header>
    );
}