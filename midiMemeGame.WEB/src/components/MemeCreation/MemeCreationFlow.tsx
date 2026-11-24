"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { getPhotos } from "@/services/memeService";
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

type MemeCreationFlowProps = {
  onViewMemes: () => void;
};

export default function MemeCreationFlow({
  onViewMemes,
}: MemeCreationFlowProps) {
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

  function goToStep(next: number) {
    setStep(next);
    setMaxStep((current) => Math.max(current, next));
  }

  // Fetch enabled photo ids + blobs into the session object-url cache.
  // A photo that fails to load is skipped so the rest of the pool still renders.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setPhotoAuthError(false);
      setPhotos({ status: "loading" });
      let missingToken = false;
      const urls: Record<number, string> = {};
      try {
        const token = await getToken();
        if (!token) {
          missingToken = true;
          throw new Error("Missing session token.");
        }
        const list = await getPhotos(token, controller.signal);
        await Promise.all(
          list.map(async (photo) => {
            try {
              const blob = await getPhotoBlob(
                photo.id,
                token,
                controller.signal,
              );
              const url = URL.createObjectURL(blob);
              objectUrls.current.add(url);
              urls[photo.id] = url;
            } catch {
              // Skip this photo.
            }
          }),
        );
        if (cancelled) {
          for (const url of Object.values(urls)) {
            URL.revokeObjectURL(url);
            objectUrls.current.delete(url);
          }
          return;
        }
        setPhotos(
          list.length > 0 && Object.keys(urls).length === 0
            ? { status: "error" }
            : { status: "ready", urls },
        );
      } catch {
        if (cancelled) return;
        setPhotoAuthError(missingToken);
        setPhotos({ status: "error" });
      }
    }
    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [photoAttempt, getToken]);

  // Revoke every cached object URL when the flow unmounts.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  return (
    <div>
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
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && photoId !== null && photoUrl && (
          <PreviewStep
            photoId={photoId}
            photoUrl={photoUrl}
            photoAlt={t.photoAlt(photoId)}
            caption={trimmedCaption}
            onEdit={() => setStep(2)}
            onChangePhoto={() => setStep(1)}
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
  );
}
