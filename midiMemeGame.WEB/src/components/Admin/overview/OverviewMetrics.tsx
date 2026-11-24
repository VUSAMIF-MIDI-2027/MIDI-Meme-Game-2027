"use client";

export type OverviewMetric = {
    label: string;
    value: string | number;
    highlight?: boolean;
};

export function OverviewMetrics({
    ariaLabel,
    metrics,
}: {
    ariaLabel: string;
    metrics: OverviewMetric[];
}) {
    return (
        <section
            aria-label={ariaLabel}
            className="grid grid-cols-1 divide-y divide-white/15 overflow-hidden rounded-xl border border-white/15 bg-[#0d1013] sm:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1.5fr)] sm:divide-x sm:divide-y-0 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.25fr)]"
        >
            {metrics.map((metric) => (
                <div
                    key={metric.label}
                    className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
                        metric.highlight ? "bg-white/[0.06]" : "bg-[#0d1013]"
                    }`}
                >
                    <span className="shrink-0 text-xs leading-normal font-medium text-white/60">
                        {metric.label}
                    </span>
                    <span
                        className={`text-right leading-none tabular-nums ${
                            metric.highlight
                                ? "text-sm font-bold text-white"
                                : "text-xl font-bold text-white"
                        }`}
                    >
                        {metric.value}
                    </span>
                </div>
            ))}
        </section>
    );
}