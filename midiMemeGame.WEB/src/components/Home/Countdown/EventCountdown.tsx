"use client";

import { eventCountdownText } from "@/app/pageText";
import { useLanguage } from "@/context/LanguageContext";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import { EventPhaseSummary } from "./EventPhaseSummary";

export default function EventCountdown() {
    const { lang } = useLanguage();
    const { state, retry } = useEventSchedule();
    const copy = eventCountdownText[lang];

    return (
        <section
            className="pointer-events-none relative z-10 mx-auto mt-8.5 w-full max-w-190 text-center sm:mt-8"
            aria-labelledby="countdown-heading"
        >
            {state.status === "ready" ? (
                <EventPhaseSummary schedule={state.schedule} lang={lang} />
            ) : (
                <div className="mx-auto max-w-md py-3">
                    <h2 id="countdown-heading" className="text-sm font-extrabold tracking-widest uppercase">
                        {copy.schedule}
                    </h2>
                    <p
                        role={state.status === "error" ? "alert" : "status"}
                        className="mt-3 text-sm text-text-muted"
                    >
                        {copy[state.status]}
                    </p>
                    {state.status === "error" && (
                        <button
                            type="button"
                            onClick={retry}
                            className="pointer-events-auto mt-2 min-h-11 rounded-md px-3 text-sm font-bold text-[#70cfff] underline focus-visible:outline-2 focus-visible:outline-midi-blue"
                        >
                            {copy.retry}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
