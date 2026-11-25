"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import Image from "next/image";
import { LoaderCircle, CheckCircle2, Clock, Trophy, Undo2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { ApiError } from "@/services/ApiError";
import MemeCard from "@/components/Shared/MemeCard";
import { getPhotoBlob } from "@/services/userService";
import { getResultReview, publishPodium, unpublishResults, type AdminResultReview } from "@/services/adminService";

const copy = {
    lt: {
        wait: "Laukiama balsavimo pabaigos", schedule: "Renginio tvarkaraštis dar nenustatytas.",
        reload: "Atnaujinti", failed: "Nepavyko įkelti rezultatų.", saveError: "Nepavyko paskelbti rezultatų.",
        contactError: "Patikrinkite laimėtojų el. pašto adresus.", denied: "Reikalinga administratoriaus prieiga.",
        invalid: "Pasirinkimas nebegalioja. Atnaujinkite kandidatų sąrašą.",
        review: "Prizinės vietos", final: "Rezultatai paskelbti",
        place: "Vieta", votes: "Balsai", author: "Autorius nenurodytas", empty: "Į galutinę įskaitą nepateko nė vienas memas.",
        publish: "Paskelbti rezultatus", saving: "Skelbiama…", confirm: "Patvirtinti ir paskelbti",
        verify: "Ar paskelbti šiuos rezultatus?", consequence: "Rezultatai taps vieši. Laimėtojų laiškai bus įtraukti į siuntimo eilę.",
        cancel: "Grįžti", ranking: "Visi įskaitos memai",
        instructions: "Podiumas užpildytas pagal balsus. Norėdami pakeisti vietą, pasirinkite memą ir spauskite vietos numerį arba nutempkite kortelę į podiumą.",
        assignPlace: "Skirti vietą",
        unpublish: "Atšaukti paskelbimą",
        unpublishing: "Atšaukiama…",
        unpublishConfirm: "Patvirtinti atšaukimą",
        unpublishVerify: "Ar atšaukti rezultatų paskelbimą?",
        unpublishConsequence: "Rezultatai nebebus viešai prieinami. Memai ir surinkti balsai išliks.",
        unpublishError: "Nepavyko atšaukti rezultatų paskelbimo.",
    },
    en: {
        wait: "Waiting for voting to close", schedule: "The event schedule has not been set.",
        reload: "Refresh", failed: "Could not load results.", saveError: "Could not publish results.",
        contactError: "Check the winners’ email addresses.", denied: "Administrator access is required.",
        invalid: "This selection is no longer valid. Refresh the candidates.",
        review: "Prize places", final: "Results published",
        place: "Place", votes: "Votes", author: "Unknown author", empty: "No memes qualified for the final ranking.",
        publish: "Publish results", saving: "Publishing…", confirm: "Confirm and publish",
        verify: "Publish these results?", consequence: "Results will become public and winner emails will be queued.",
        cancel: "Back", ranking: "All ranked memes",
        instructions: "The podium is filled by vote count. To change a place, select a meme and click a place number or drag the card onto the podium.",
        assignPlace: "Assign place",
        unpublish: "Unpublish results",
        unpublishing: "Unpublishing…",
        unpublishConfirm: "Confirm unpublishing",
        unpublishVerify: "Unpublish these results?",
        unpublishConsequence: "Results will no longer be publicly available. Memes and collected votes will be preserved.",
        unpublishError: "Could not unpublish results.",
    },
};

const panel = "rounded-xl border border-white/15 bg-[#101418] p-5 sm:p-6";
const action = "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-midi-blue px-5 font-semibold text-white transition hover:bg-[#65d5ff] hover:shadow-lg hover:shadow-sky-500/20 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midi-blue disabled:cursor-wait disabled:opacity-50";

const podiumOrder = ["md:order-2", "md:order-1", "md:order-3"];
const podiumGrid = "mx-auto grid max-w-5xl gap-3 md:flex md:items-end md:justify-center";

function PodiumStep({ place }: { place: number }) {
    const finish = [
        "border-amber-300/55 bg-amber-400/15 text-amber-200 md:h-28",
        "border-slate-300/45 bg-slate-400/15 text-slate-200 md:h-20",
        "border-orange-400/45 bg-orange-500/15 text-orange-200 md:h-12",
    ][place - 1];
    return <div aria-hidden="true" className={`mt-2 grid h-10 place-items-center rounded-b-lg border-t-2 text-3xl font-black tabular-nums ${finish}`}>{place}</div>;
}

export function AdminResults() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = copy[lang];
    const [review, setReview] = useState<AdminResultReview | null>(null);
    const [picks, setPicks] = useState<number[]>([]);
    const [photos, setPhotos] = useState<Record<number, string>>({});
    const [active, setActive] = useState<number | null>(null);
    const [revision, setRevision] = useState(0);
    const [issue, setIssue] = useState<keyof typeof t | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);
    const [saving, setSaving] = useState(false);

    const submitting = useRef(false);

    function reload() {
        setActive(null);
        setReview(null);
        setIssue(null);
        setConfirming(false);
        setConfirmingUnpublish(false);
        setRevision(value => value + 1);
    }

    useEffect(() => {
        const abort = new AbortController();
        const urls: string[] = [];
        async function load() {
            try {
                const token = await getToken();
                if (!token) throw ApiError.unauthorized();
                const result = await getResultReview(token, abort.signal);
                if (abort.signal.aborted) return;
                setPicks(result.candidates.slice(0, 3).map(candidate => candidate.id));
                setPhotos({});
                setReview(result);
                const visible = result.published ? result.winners : result.candidates;
                const ids = [...new Set(visible.map(c => c.sourcePhotoId))];
                async function loadPhoto(id: number) {
                    let url = "";
                    try {
                        const blob = await getPhotoBlob(id, token!, abort.signal);
                        if (abort.signal.aborted) return;
                        url = URL.createObjectURL(blob);
                        urls.push(url);
                    } catch {
                        if (abort.signal.aborted) return;
                    }
                    setPhotos(previous => ({ ...previous, [id]: url }));
                }
                // Limit simultaneous authenticated image downloads across the full ranking.
                let next = 0;
                async function worker() {
                    while (next < ids.length && !abort.signal.aborted) await loadPhoto(ids[next++]);
                }
                await Promise.all(Array.from({ length: Math.min(4, ids.length) }, worker));
            } catch (error) {
                if (abort.signal.aborted) return;
                if (error instanceof ApiError && error.code === 2407) setIssue("wait");
                else if (error instanceof ApiError && error.code === 2400) setIssue("schedule");
                else if (error instanceof ApiError && [401, 403].includes(error.status)) setIssue("denied");
                else setIssue("failed");
            }
        }
        void load();
        return () => {
            abort.abort();
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [getToken, revision]);

    async function unpublish() {
        if (
            submitting.current ||
            !review?.published ||
            !confirmingUnpublish
        ) return;

        submitting.current = true;
        setSaving(true);
        setIssue(null);

        try {
            const token = await getToken();

            if (!token)
                throw ApiError.unauthorized();

            await unpublishResults(token);

            reload();
        } catch (error) {
            if (
                error instanceof ApiError &&
                [401, 403].includes(error.status)
            ) {
                setIssue("denied");
            } else {
                setIssue("unpublishError");
            }

            setConfirmingUnpublish(false);
        } finally {
            submitting.current = false;
            setSaving(false);
        }
    }

    async function publish() {
        if (submitting.current || !review || review.published || !confirming) return;
        if (picks.length !== Math.min(3, review.candidates.length) || new Set(picks).size !== picks.length) return;
        submitting.current = true;
        setSaving(true);
        setIssue(null);
        try {
            const token = await getToken();
            if (!token) throw ApiError.unauthorized();
            await publishPodium(token, picks);
            reload();
        } catch (error) {
            if (error instanceof ApiError && [2407, 2409].includes(error.code ?? 0)) reload();
            else if (error instanceof ApiError && error.status === 422) setIssue("contactError");
            else if (error instanceof ApiError && error.status === 400) setIssue("invalid");
            else if (error instanceof ApiError && [401, 403].includes(error.status)) setIssue("denied");
            else setIssue("saveError");
            setConfirming(false);
        } finally {
            submitting.current = false;
            setSaving(false);
        }
    }

    if (!review && !issue) return <div className="relative min-h-56"><LoadingScreen overlay="section" /></div>;
    if (!review) return (
        <div className={panel} role="status">
            <Clock aria-hidden className="mb-3 size-6 text-midi-blue" />
            <p>{issue && t[issue]}</p>
            <button className="mt-4 min-h-11 text-midi-blue underline" onClick={reload}>{t.reload}</button>
        </div>
    );

    function assign(index: number, id: number) {
        setPicks(previous => {
            const next = [...previous];
            const oldIndex = next.indexOf(id);
            if (oldIndex >= 0) next[oldIndex] = next[index];
            next[index] = id;
            return next;
        });
        setActive(null);
    }

    const lt = lang === "lt";
    const chosen = review.candidates.find(c => c.id === active);
    const editing = !confirming && !saving;

    function tile(c: AdminResultReview["candidates"][number]) {
        const url = photos[c.sourcePhotoId];
        return <span className="pointer-events-none block overflow-hidden rounded-lg bg-black">
            <span className="relative grid aspect-[3/2] place-items-center text-xs text-white/60">
                {url ? <Image src={url} alt="" fill unoptimized sizes="(min-width: 768px) 270px, 80vw" className="object-cover" /> :
                    url === undefined ? <LoaderCircle aria-label={lt ? "Kraunama" : "Loading"} className="size-4 animate-spin" /> :
                        (lt ? "Nuotrauka nepasiekiama" : "Photo unavailable")}
            </span>
            <span className="block break-words bg-white px-3 py-3 text-center font-semibold text-black">{c.caption}</span>
            <span className="block px-3 py-2 text-xs text-white/75">{c.userName || t.author} · {t.votes}: {c.score}</span>
        </span>;
    }

    function preview(meme: AdminResultReview["candidates"][number], selected: boolean) {
        const url = photos[meme.sourcePhotoId];
        return url === undefined
            ? <div className="relative aspect-[3/2] rounded-xl bg-white/5"><LoadingScreen overlay="section" /></div>
            : <MemeCard image={url} imageAlt={`${lang === "lt" ? "Memo nuotrauka" : "Meme photo"} #${meme.sourcePhotoId}`}
                caption={meme.caption} selected={selected} metaLabel={meme.userName || t.author} />;
    }

    return (
        <section className="space-y-4">
            <div className={panel}>
                <div className="mb-5 flex items-center gap-3">
                    {review.published ? <CheckCircle2 aria-hidden className="text-emerald-400" /> : <Trophy aria-hidden className="text-midi-blue" />}
                    <h2 className="text-xl font-bold">{review.published ? t.final : t.review}</h2>
                </div>
                {review.published && review.publishedAtUtc && <p className="mb-4 text-sm text-white/65">{new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vilnius" }).format(new Date(/Z$|[+-]\d\d:\d\d$/.test(review.publishedAtUtc) ? review.publishedAtUtc : review.publishedAtUtc + "Z"))}</p>}
                {review.published ? (
                    <ol className={podiumGrid}>
                        {review.winners.map(w => (
                            <li key={w.id} className={`min-w-0 space-y-2 md:w-1/3 ${podiumOrder[w.place - 1]}`}>
                                <strong>{t.place} {w.place}</strong>
                                {preview(w, false)}<p className="text-white/70">{t.votes}: {w.score}</p>
                                {w.email && <a className="break-all text-midi-blue underline" href={`mailto:${w.email}`}>{w.email}</a>}
                                <PodiumStep place={w.place} />
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="space-y-6">
                        {editing && picks.length > 0 && <p className="text-sm text-white/70">{t.instructions}</p>}
                        <ol className={podiumGrid}>
                            {picks.map((id, i) => {
                                const meme = review.candidates.find(c => c.id === id);
                                if (!meme) return null;
                                const accepts = editing && !!chosen && chosen.id !== id;
                                return (
                                    <li key={i} onDragOver={e => { if (accepts) e.preventDefault(); }}
                                        onDrop={e => { e.preventDefault(); if (accepts && chosen) assign(i, chosen.id); }}
                                        className={`min-w-0 rounded-xl border p-3 transition-colors md:w-1/3 ${podiumOrder[i]} ${accepts ? "border-midi-blue bg-sky-950/50" : "border-white/15 bg-[#0c1014]"}`}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <strong className={["text-amber-300", "text-slate-300", "text-orange-300"][i]}>{t.place} {i + 1}</strong>
                                            <span className="text-xs text-white/65">{t.votes}: {meme.score}</span>
                                        </div>
                                        <button type="button" disabled={!editing}
                                            draggable={editing} onDragStart={e => {
                                                e.dataTransfer.setData("text/plain", String(id));
                                                e.dataTransfer.effectAllowed = "move";
                                                setActive(id);
                                            }} onDragEnd={() => setActive(null)}
                                            aria-label={`${t.place} ${i + 1} · ${accepts ? chosen.caption : meme.caption}`}
                                            onClick={() => { if (accepts) assign(i, chosen.id); else setActive(active === id ? null : id); }}
                                            className="block w-full text-left focus-visible:outline-2 focus-visible:outline-midi-blue enabled:cursor-pointer">
                                            {tile(meme)}
                                        </button>
                                        <PodiumStep place={i + 1} />
                                    </li>
                                );
                            })}
                        </ol>
                        {editing && review.candidates.length > 0 && (
                            <div className="border-t border-white/10 pt-4">
                                <h3 className="mb-3 font-semibold">{t.ranking} ({review.candidates.length})</h3>
                                <ol className="grid grid-cols-2 items-start gap-3 lg:grid-cols-4">
                                    {review.candidates.map((c, index) => {
                                        const place = picks.indexOf(c.id) + 1;
                                        return (
                                            <li key={c.id} className={`min-w-0 rounded-lg border p-2 ${active === c.id ? "border-midi-blue" : "border-white/15"}`}>
                                                <button type="button" draggable aria-pressed={active === c.id}
                                                    onDragStart={e => { e.dataTransfer.setData("text/plain", String(c.id)); e.dataTransfer.effectAllowed = "move"; setActive(c.id); }}
                                                    onDragEnd={() => setActive(null)} onClick={() => setActive(active === c.id ? null : c.id)}
                                                    className="w-full cursor-grab text-left focus-visible:outline-midi-blue">
                                                    <span className="mb-2 flex flex-wrap justify-between gap-1 px-1 text-xs text-white/75">
                                                        <span>#{index + 1}</span>
                                                        {place > 0 && <span className="text-midi-blue">{t.place} {place}</span>}
                                                    </span>
                                                    {tile(c)}
                                                </button>
                                                {active === c.id && (
                                                    <div className="mt-2 flex flex-wrap gap-2 px-1" role="group" aria-label={t.assignPlace}>
                                                        {picks.map((_, i) => (
                                                            <button key={i} type="button" disabled={place === i + 1}
                                                                onClick={() => assign(i, c.id)}
                                                                aria-label={`${t.assignPlace} ${i + 1}`}
                                                                className="min-h-10 min-w-10 rounded-md border border-white/20 px-2 text-sm enabled:hover:border-midi-blue disabled:opacity-45">
                                                                {i + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        )}
                    </div>
                )}
                {(review.published ? !review.winners.length : !picks.length) && <p>{t.empty}</p>}
            </div>
            {issue && <div role="alert" className={panel}>{t[issue]} <button className="underline" onClick={reload}>{t.reload}</button></div>}
            {!review.published && (confirming ? (
                <div className={panel}>
                    <h3 className="font-bold">{t.verify}</h3><p className="my-3 text-white/75">{t.consequence}</p>
                    <button className={action} disabled={saving} onClick={publish}>{saving ? t.saving : t.confirm}</button>
                    <button className="ml-4 min-h-11" disabled={saving} onClick={() => setConfirming(false)}>{t.cancel}</button>
                </div>
            ) : <div className="flex flex-wrap items-center gap-4">
                <button type="button" className={action} onClick={() => {
                    setActive(null);
                    setConfirming(true);
                }}><Trophy aria-hidden className="size-4" />{t.publish}</button>
            </div>)}
            {review.published && (
                confirmingUnpublish ? (
                    <div className={panel}>
                        <h3 className="font-bold text-red-400">
                            {t.unpublishVerify}
                        </h3>

                        <p className="my-3 text-white/75">
                            {t.unpublishConsequence}
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={unpublish}
                                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-5 font-semibold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-50"
                            >
                                {saving ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <Undo2 className="size-4" />
                                )}

                                {saving
                                    ? t.unpublishing
                                    : t.unpublishConfirm}
                            </button>

                            <button
                                type="button"
                                className="min-h-11"
                                disabled={saving}
                                onClick={() => setConfirmingUnpublish(false)}
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => setConfirmingUnpublish(true)}
                            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-5 font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-500/20 disabled:opacity-50"
                        >
                            <Undo2 className="size-4" aria-hidden="true" />
                            {t.unpublish}
                        </button>
                    </div>
                )
            )}
        </section>
    );
}
