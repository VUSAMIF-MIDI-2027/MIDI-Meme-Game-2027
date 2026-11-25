"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useEventPhase } from "@/hooks/useEventPhase";
import type { EventSchedule } from "@/services/eventScheduleService";
import MemeCard from "@/components/Shared/MemeCard";
import { MEME_SUBMISSION_LIMIT } from "@/services/memeService";
import {
  CAPTION_MAX_CHARS,
  isCaptionValid,
  memeCreationText,
} from "@/components/MemeCreation/memeCreationText";
import { yourMemesText } from "./yourMemesText";

export type MemeStatus = "approved" | "pending" | "rejected";

export type YourMeme = {
  id: number;
  image: string;
  sourcePhotoId: number;
  caption: string;
  submittedAt: string;
  status: MemeStatus;
  isInvalidated: boolean;
  isPhotoMissing: boolean;
};

const statusStyles: Record<MemeStatus, string> = {
  approved: "text-green-400",
  pending: "text-amber-400",
  rejected: "text-red-400",
};

const actionButtonClass =
  "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass = `${actionButtonClass} border-white/20 text-white/80 hover:border-midi-blue hover:text-white disabled:hover:border-white/20 disabled:hover:text-white/80`;

const dangerButtonClass = `${actionButtonClass} border-red-400/40 text-red-300 hover:border-red-400 hover:text-red-200 disabled:hover:border-red-400/40 disabled:hover:text-red-300`;

type YourMemeItemProps = {
  meme: YourMeme;
  imageAlt: string;
  statusLabel: string;
  statusClassName: string;
  metaLabel: string;
  submissionsOpen: boolean;
  lang: Lang;
  onSaveCaption?: (id: number, caption: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
};

function YourMemeItem({
  meme,
  imageAlt,
  statusLabel,
  statusClassName,
  metaLabel,
  submissionsOpen,
  lang,
  onSaveCaption,
  onDelete,
}: YourMemeItemProps) {
  const t = yourMemesText[lang];
  const ct = memeCreationText[lang];
  const isPhotoUnavailable = meme.isInvalidated || meme.isPhotoMissing;
  const [draft, setDraft] = useState(meme.caption);
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [failed, setFailed] = useState(false);
  const editDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  const trimmed = draft.trim();
  const charsOver = trimmed.length > CAPTION_MAX_CHARS;
  const draftValid = isCaptionValid(draft);
  const draftChanged = trimmed !== meme.caption.trim();
  const captionId = `meme-caption-${meme.id}`;

  function openEdit() {
    setDraft(meme.caption);
    setFailed(false);
    editDialog.current?.showModal();
    setEditOpen(true);
  }

  async function handleSave() {
    if (!onSaveCaption || busy) return;
    setBusy("save");
    setFailed(false);
    try {
      await onSaveCaption(meme.id, trimmed);
      editDialog.current?.close();
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  function openDelete() {
    setFailed(false);
    deleteDialog.current?.showModal();
  }

  async function handleDelete() {
    if (!onDelete || busy) return;
    setBusy("delete");
    setFailed(false);
    try {
      await onDelete(meme.id);
      deleteDialog.current?.close();
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <MemeCard
        image={meme.image}
        imageAlt={imageAlt}
        caption={meme.caption}
        status={isPhotoUnavailable
          ? { label: meme.isPhotoMissing ? t.photoMissing : t.invalidated }
          : { label: statusLabel, className: statusClassName }}
        muted={isPhotoUnavailable}
        layout="meta-footer"
        metaLabel={metaLabel}
        footer={
          onSaveCaption || onDelete || failed ? (
            <div className="flex flex-col gap-2">
              {(onSaveCaption || onDelete) && (
                <div className="flex gap-2">
                  {onSaveCaption && (
                    <button
                      type="button"
                      onClick={openEdit}
                      disabled={
                        !submissionsOpen || isPhotoUnavailable || busy !== null
                      }
                      className={secondaryButtonClass}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      {t.edit}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={openDelete}
                      disabled={!submissionsOpen || busy !== null}
                      aria-busy={busy === "delete"}
                      className={dangerButtonClass}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      {busy === "delete" ? t.deleting : t.delete}
                    </button>
                  )}
                </div>
              )}
              {failed && (
                <p role="alert" className="text-sm text-rose-400">
                  {t.actionFailed}
                </p>
              )}
            </div>
          ) : null
        }
      />
      <dialog
        ref={editDialog}
        aria-labelledby={`${captionId}-title`}
        onClose={() => setEditOpen(false)}
        onCancel={(event) => {
          if (busy !== null) event.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto rounded-xl border border-white/15 bg-[#0d1013] p-5 text-white backdrop:bg-black/80 sm:p-8"
      >
        <h2 id={`${captionId}-title`} className="text-xl font-bold text-white">
          {t.editTitle}
        </h2>
        <div className="mt-4 grid items-stretch gap-6 sm:grid-cols-2">
          {editOpen && (
            <div className="min-w-0 wrap-anywhere">
              <MemeCard
                image={meme.image}
                imageAlt={imageAlt}
                caption={trimmed || ct.captionPlaceholderCard}
              />
            </div>
          )}
          <div className="flex min-w-0 flex-col justify-between gap-4">
            <div>
              <label
                htmlFor={captionId}
                className="block text-sm font-semibold text-white"
              >
                {t.captionLabel}
              </label>
              <textarea
                id={captionId}
                aria-describedby={`${captionId}-limits`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={ct.captionPlaceholder}
                rows={4}
                disabled={busy !== null}
                className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-[#0b0f12] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-midi-blue disabled:opacity-60"
              />
              <p id={`${captionId}-limits`} className={`mt-2 text-sm tabular-nums ${charsOver ? "text-rose-400" : "text-white/60"}`}>
                {ct.captionCount(trimmed.length)}
              </p>
              {failed && (
                <p role="alert" className="mt-3 text-sm text-rose-400">
                  {t.actionFailed}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={busy !== null || !draftValid || !draftChanged}
                aria-busy={busy === "save"}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-midi-blue px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "save" ? t.saving : t.save}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => editDialog.current?.close()}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      </dialog>
      <dialog
        ref={deleteDialog}
        aria-labelledby={`${captionId}-delete-title`}
        onCancel={(event) => {
          if (busy !== null) event.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-white/15 bg-[#0d1013] p-6 text-white backdrop:bg-black/80 sm:p-8"
      >
        <h2
          id={`${captionId}-delete-title`}
          className="text-lg font-bold text-white"
        >
          {t.delete}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          {t.deleteConfirm}
        </p>
        {failed && (
          <p role="alert" className="mt-3 text-sm text-rose-400">
            {t.actionFailed}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => deleteDialog.current?.close()}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy !== null}
            aria-busy={busy === "delete"}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "delete" ? t.deleting : t.delete}
          </button>
        </div>
      </dialog>
    </>
  );
}

type YourMemesProps = {
  memes?: readonly YourMeme[];
  schedule?: EventSchedule;
  onSaveCaption?: (id: number, caption: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
};

const YourMemes = ({
  memes = [],
  schedule,
  onSaveCaption,
  onDelete,
}: YourMemesProps) => {
  const { lang } = useLanguage();
  const t = yourMemesText[lang];
  const { phase } = useEventPhase(schedule);
  const submissionsOpen = phase === "submissions";
  const submissionsEnded = phase === "voting" || phase === "ended";
  const limitReached =
    memes.filter((meme) => !meme.isInvalidated).length >= MEME_SUBMISSION_LIMIT;
  const dateTimeFormatter = new Intl.DateTimeFormat(
    lang === "lt" ? "lt-LT" : "en-GB",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Vilnius",
    },
  );

  return (
    <section
      id="your-memes"
      aria-labelledby="your-memes-title"
      className="mt-14 scroll-mt-24 border-t border-white/15 pt-12 sm:mt-18 sm:pt-16 lg:mt-20 lg:pt-18"
    >
      <div>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">
              {t.eyebrow}
            </p>
            <h2
              id="your-memes-title"
              className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl"
            >
              {t.title}
            </h2>
          </div>
          {submissionsOpen && memes.length > 0 && !limitReached && (
            <Link
              href="/dashboard/create"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-midi-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-midi-blue/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
            >
              <Plus aria-hidden="true" className="size-4" />
              {t.create}
            </Link>
          )}
        </div>
        {memes.length === 0 ? (
          <div className="relative">
            <div
              className="skeleton-drift grid gap-6 md:grid-cols-3"
              aria-hidden="true"
            >
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-white/15 bg-[#1d1d1d]"
                >
                  <div className="aspect-[4/3] bg-white/10" />
                  <div className="flex min-h-20 items-center justify-center px-5 py-4">
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative flex w-full max-w-xs flex-col items-center gap-5 rounded-xl border border-white/15 bg-[#1d1d1d] px-5 py-5 shadow-lg sm:px-8 sm:py-6">
                <div className="relative size-24 shrink-0 self-center sm:size-28">
                  <Image
                    src={
                      submissionsEnded
                        ? "/jakub/jakub02.webp"
                        : "/jakub/jakub.webp"
                    }
                    width={128}
                    height={128}
                    alt=""
                    className="size-full rounded-full border-2 border-midi-blue object-cover"
                  />
                  {!submissionsEnded && (
                    <Image
                      src="/cats/sleepy.svg"
                      width={48}
                      height={48}
                      alt=""
                      aria-hidden="true"
                      className="absolute -top-10 left-1/2 size-20 -translate-x-1/2 rotate-[28deg] select-none [image-rendering:pixelated] sm:-top-16 sm:size-36"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  {submissionsEnded && (
                    <p className="mb-1 text-center text-sm text-white/60">
                      {t.emptyEndedNotice}
                    </p>
                  )}
                  <p className="text-center text-base text-midi-gray">
                    {submissionsEnded ? t.emptyEndedTitle : t.emptyTitle}
                  </p>
                  {submissionsEnded && (
                    <p className="mt-1 text-center text-sm font-semibold text-red-400">
                      {t.emptyEndedCaption}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4">
                    <Link
                      href="/rules"
                      className="inline-flex min-h-9 items-center text-sm text-white/60 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-midi-blue"
                    >
                      {t.rulesLink}
                    </Link>
                    {submissionsOpen && (
                      <Link
                        href="/dashboard/create"
                        className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-midi-blue px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-midi-blue/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                      >
                        <Plus aria-hidden="true" className="size-4" />
                        {t.create}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {memes.map((meme) => (
              <YourMemeItem
                key={meme.id}
                meme={meme}
                imageAlt={t.photoAlt(meme.sourcePhotoId)}
                statusLabel={t.status[meme.status]}
                statusClassName={statusStyles[meme.status]}
                metaLabel={`${t.submitted} ${dateTimeFormatter.format(new Date(meme.submittedAt))}`}
                submissionsOpen={submissionsOpen}
                lang={lang}
                onSaveCaption={onSaveCaption}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default YourMemes;
