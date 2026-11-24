"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Camera,
    Image as ImageIcon,
    LayoutDashboard,
    MonitorPlay,
    Settings as SettingsIcon,
    ShieldCheck,
    Trophy,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SECTIONS, type AdminTranslations, type Section } from "@/app/admin/types";
import { overviewText } from "@/components/Admin/overview/overviewText";

type AdminSidebarProps = {
    t: AdminTranslations;
    section: Section;
    onSelect: (next: Section) => void;
};

const SECTION_ICONS: Record<Section, typeof LayoutDashboard> = {
    overview: LayoutDashboard,
    "meme-approval": ImageIcon,
    photos: Camera,
    results: Trophy,
    settings: SettingsIcon,
};

export function AdminSidebar({ t, section, onSelect }: AdminSidebarProps) {
    const { lang } = useLanguage();
    const overviewLabel = overviewText[lang].title;

    return (
        <aside className="flex shrink-0 flex-col border-b border-white/10 bg-[#0d1013] px-5 pt-2 lg:border-r lg:border-b-0 lg:p-6">
            <div className="hidden items-center gap-3 px-3 py-5 lg:flex">
                <ShieldCheck className="size-7 text-midi-blue" aria-hidden="true" />
                <div>
                    <p className="text-lg font-bold">{t.admin}</p>
                    <p className="mt-1 text-xs text-white/45">{t.nightWithMidi}</p>
                </div>
            </div>

            <p className="mb-4 hidden px-3 pt-8 text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase lg:block">
                {t.tools}
            </p>

            <nav
                aria-label={t.admin}
                className="grid grid-cols-3 sm:grid-cols-5 gap-1 lg:flex lg:flex-col lg:gap-2"
            >
                {SECTIONS.map(({ id, getTitle }) => {
                    const Icon = SECTION_ICONS[id];
                    const isActive = section === id;
                    const label =
                        id === "overview"
                            ? overviewLabel
                            : getTitle(t) || id;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => onSelect(id)}
                            className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 border-b-2 px-1 py-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-midi-blue sm:text-sm lg:justify-start lg:gap-3 lg:rounded-lg lg:border-b-0 lg:px-4 ${
                                isActive
                                    ? "border-midi-blue text-[#70cfff] lg:bg-midi-blue lg:text-white"
                                    : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
                            <span className="truncate">{label}</span>
                        </button>
                    );
                })}
            </nav>

            <Link
                href="/admin/presentation"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 mb-3 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-midi-blue/60 px-4 text-sm font-semibold text-[#70cfff] transition-colors hover:bg-midi-blue hover:text-white focus-visible:outline-2 focus-visible:outline-midi-blue lg:mb-0"
            >
                <MonitorPlay className="size-4 shrink-0" aria-hidden="true" />
                {t.presentationMode}
            </Link>

            <Link
                href="/dashboard"
                className="hidden min-h-11 items-center gap-2 px-3 text-sm text-white/50 hover:text-white lg:mt-auto lg:inline-flex lg:pt-12"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t.back}
            </Link>
        </aside>
    );
}