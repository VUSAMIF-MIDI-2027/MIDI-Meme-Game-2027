import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

type GalleryMessageProps = {
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
    icon?: ReactNode;
};

export function GalleryMessage({ title, description, action, icon }: GalleryMessageProps) {
    return (
        <div role={action ? "alert" : undefined} className="flex flex-col items-center rounded-2xl border border-white/15 bg-[#0a0a0a] px-6 py-12 text-center sm:py-16">
            {icon ?? <TriangleAlert aria-hidden="true" className="size-9 text-amber-400" />}
            <h2 className="mt-5 text-2xl leading-tight font-bold text-midi-gray sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-text-muted">{description}</p>
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="mt-7 inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-midi-blue px-6 py-3 text-base font-bold text-white transition-colors hover:bg-midi-blue/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#70cfff]"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
