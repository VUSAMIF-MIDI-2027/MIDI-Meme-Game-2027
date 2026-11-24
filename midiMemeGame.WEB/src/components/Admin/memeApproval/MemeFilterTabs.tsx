"use client";

import type { MemeStatusId } from "@/services/adminService";

export type MemeFilterTab = {
    id: MemeStatusId;
    label: string;
    count: number;
};

type MemeFilterTabsProps = {
    tabs: MemeFilterTab[];
    activeTab: MemeStatusId;
    ariaLabel: string;
    onSelect: (id: MemeStatusId) => void;
};

export function MemeFilterTabs({
    tabs,
    activeTab,
    ariaLabel,
    onSelect,
}: MemeFilterTabsProps) {
    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            className="flex flex-wrap gap-2 border-b border-white/15 pb-4"
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onSelect(tab.id)}
                        className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${
                            isActive
                                ? "border-midi-blue bg-midi-blue text-white"
                                : "border-white/15 bg-[#0d1013] text-white/70 hover:border-white/30 hover:text-white"
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={`rounded-md px-2 py-0.5 text-xs tabular-nums ${
                                isActive
                                    ? "bg-black/25 text-white"
                                    : "bg-[#0b0f12] text-white/60"
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}