"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  getPhotos,
  MOCK_PHOTO_URLS,
  useMockPhotos,
} from "@/services/memeService";
import { getPhotoBlob } from "@/services/userService";
import {
  CAPTION_MAX_CHARS,
  CAPTION_MAX_WORDS,
  memeCreationText,
} from "./memeCreationText";
import StepIndicator from "./StepIndicator";
import PhotoStep from "./steps/PhotoStep";
import CaptionStep from "./steps/CaptionStep";
import PreviewStep from "./steps/PreviewStep";
import ConfirmationStep from "./steps/ConfirmationStep";

export type PhotoPool =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; urls: Record<number, string> };

const CONFIRMATION_STEP = 4;

type MemeCreationModalProps = {
  onClose: () => void;
  onViewMemes: () => void;
};

export default function MemeCreationModal({
  onClose,
  onViewMemes,
}: MemeCreationModalProps) {
  const { getToken } = useAuth();
  const { lang } = useLanguage();
  const t = memeCreationText[lang];

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [photoId, setPhotoId] = useState<number | null>(null);
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<PhotoPool>({ status: "idle" });
  const [photoAttempt, setPhotoAttempt] = useState(1);
  const [photoAuthError, setPhotoAuthError] = useState(false);

  const dialog = useRef<HTMLDialogElement>(null);
  const objectUrls = useRef<Set<string>>(new Set());

  const photoUrl =
    photos.status === "ready" && photoId !== null
      ? (photos.urls[photoId] ?? null)
      : null;

  const trimmedCaption = caption.trim();
  const captionWordCount = trimmedCaption
    ? trimmedCaption.split(/\s+/).filter(Boolean).length
    : 0;
  const captionIsValid =
    trimmedCaption.length > 0 &&
    trimmedCaption.length <= CAPTION_MAX_CHARS &&
    captionWordCount <= CAPTION_MAX_WORDS;

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function requestClose() {
    const hasProgress = step > 1 && step < CONFIRMATION_STEP;
    if (hasProgress && !window.confirm(t.confirmClose)) return;
    dialog.current?.close();
  }

  function goToStep(next: number) {
    setStep(next);
    setMaxStep((current) => Math.max(current, next));
  }

  // Fetch enabled photo ids + blobs into the session object-url cache.
  useEffect(() => {
    if (photoAttempt === 0) return;

    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setPhotoAuthError(false);
      setPhotos({ status: "loading" });
      let missingToken = false;
      try {
        const token = await getToken();
        if (!token) {
          missingToken = true;
          throw new Error("Missing session token.");
        }
        const list = await getPhotos(token, controller.signal);
        const urls: Record<number, string> =
          list.length === 0 && useMockPhotos ? { ...MOCK_PHOTO_URLS } : {};
        try {
          await Promise.all(
            list.map(async (photo) => {
              const blob = await getPhotoBlob(
                photo.id,
                token,
                controller.signal,
              );
              const url = URL.createObjectURL(blob);
              objectUrls.current.add(url);
              urls[photo.id] = url;
            }),
          );
        } catch (error) {
          for (const url of Object.values(urls)) {
            URL.revokeObjectURL(url);
            objectUrls.current.delete(url);
          }
          throw error;
        }
        if (!cancelled) setPhotos({ status: "ready", urls });
      } catch {
        if (cancelled) return;
        if (useMockPhotos) {
          setPhotos({ status: "ready", urls: MOCK_PHOTO_URLS });
        } else {
          setPhotoAuthError(missingToken);
          setPhotos({ status: "error" });
        }
      }
    }
    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [photoAttempt, getToken]);

  // Revoke every cached object URL when the modal unmounts.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="meme-creation-title"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.detail === 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        if (!inside) requestClose();
      }}
      className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-2xl overflow-x-clip overflow-y-auto rounded-xl border border-white/15 bg-[#0d1013] p-6 text-white shadow-2xl backdrop:bg-black/80 sm:p-8"
    >
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="meme-creation-title"
            className="text-sm font-semibold text-white/70"
          >
            {t.dialogLabel}
          </h2>
          <button
            type="button"
            aria-label={t.closeLabel}
            onClick={requestClose}
            className="flex size-10 cursor-pointer items-center justify-center rounded hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-midi-blue"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {step < CONFIRMATION_STEP && (
          <StepIndicator
            current={step}
            maxReached={captionIsValid ? maxStep : Math.min(maxStep, 2)}
            onSelect={goToStep}
          />
        )}
        <div aria-live="polite" aria-atomic="true" className="mt-4">
          {step === 1 && (
            <PhotoStep
              photos={photos}
              authError={photoAuthError}
              selectedId={photoId}
              onSelect={(id) => {
                setPhotoId(id);
                goToStep(2);
              }}
              onRetry={() => setPhotoAttempt((attempt) => attempt + 1)}
            />
          )}
          {step === 2 && photoId !== null && photoUrl && (
            <CaptionStep
              photoUrl={photoUrl}
              photoAlt={t.photoAlt(photoId)}
              caption={caption}
              onCaptionChange={setCaption}
              onPreview={() => goToStep(3)}
            />
          )}
          {step === 3 && photoId !== null && photoUrl && (
            <PreviewStep
              photoId={photoId}
              photoUrl={photoUrl}
              photoAlt={t.photoAlt(photoId)}
              caption={trimmedCaption}
              onEdit={() => setStep(2)}
              onSubmitted={() => goToStep(CONFIRMATION_STEP)}
            />
          )}
          {step === CONFIRMATION_STEP && (
            <ConfirmationStep
              onCreateAnother={() => {
                setPhotoId(null);
                setCaption("");
                setMaxStep(1);
                setStep(1);
              }}
              onViewMemes={onViewMemes}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}
