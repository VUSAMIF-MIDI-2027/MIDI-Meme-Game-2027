"use client";

import { useEffect, useState } from "react";
import MemeCard from "@/components/Shared/MemeCard";
import { useLanguage } from "@/context/LanguageContext";
import { apiBaseUrl } from "@/services/apiBaseUrl";

type PublishedResult = {
    id: number;
    place: number;
    sourcePhotoId: number;
    caption: string;
    userName: string | null;
    score: number;
};

type ResultsState =
    | { status: "loading" | "pending" | "error" }
    | { status: "ready"; results: PublishedResult[] };

const copy = {
    lt: {
        title: "Konkurso rezultatai",
        loading: "Kraunami rezultatai…",
        pending: "Rezultatai dar nepaskelbti.",
        error: "Nepavyko įkelti rezultatų.",
        empty: "Paskelbtų rezultatų nėra.",
        place: (place: number) => place + " vieta",
        points: (score: number) => "Taškai · " + score,
        imageAlt: "Memo nuotrauka",
    },
    en: {
        title: "Competition results",
        loading: "Loading results…",
        pending: "Results haven’t been published yet.",
        error: "Could not load the results.",
        empty: "There are no published results.",
        place: (place: number) => "Place " + place,
        points: (score: number) => "Points · " + score,
        imageAlt: "Meme photo",
    },
};

export default function ResultsPage() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const [state, setState] = useState<ResultsState>({ status: "loading" });

    useEffect(() => {
        const controller = new AbortController();

        async function loadResults() {
            try {
                const response = await fetch(apiBaseUrl + "/api/results", {
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (controller.signal.aborted) return;
                if (response.status === 404 || response.status === 409) {
                    setState({ status: "pending" });
                    return;
                }
                if (!response.ok) throw new Error("Could not load the results.");
                const results: PublishedResult[] = await response.json();
                if (!Array.isArray(results)) throw new Error("Invalid results response.");
                if (!controller.signal.aborted) setState({ status: "ready", results });
            } catch {
                if (!controller.signal.aborted) setState({ status: "error" });
            }
        }

        void loadResults();
        return () => controller.abort();
    }, []);

    return (
        <section aria-labelledby="results-heading" className="min-h-[calc(100svh-4.25rem)] bg-page-background px-5 py-12 text-white sm:px-8 sm:py-16">
            <div className="mx-auto max-w-6xl">
                <h1 id="results-heading" className="text-3xl font-extrabold sm:text-5xl">{t.title}</h1>
                {state.status !== "ready" ? (
                    <p role={state.status === "error" ? "alert" : "status"} className="mt-5 text-lg text-white/75">
                        {t[state.status]}
                    </p>
                ) : state.results.length === 0 ? (
                    <p className="mt-5 text-lg text-white/75">{t.empty}</p>
                ) : (
                    <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {state.results.map((result) => (
                            <li key={result.id} className="min-w-0">
                                <h2 className="mb-3 text-xl font-bold text-[#70cfff]">{t.place(result.place)}</h2>
                                <MemeCard
                                    image={apiBaseUrl + "/api/photos/" + result.sourcePhotoId + "/file"}
                                    imageAlt={t.imageAlt}
                                    caption={result.caption}
                                    metaLabel={result.userName ?? undefined}
                                    status={{ label: t.points(result.score) }}
                                />
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
