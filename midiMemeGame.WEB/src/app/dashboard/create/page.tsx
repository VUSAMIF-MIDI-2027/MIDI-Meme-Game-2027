"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useLanguage } from "@/context/LanguageContext";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import { useEventPhase } from "@/hooks/useEventPhase";
import { getMyMemes, MEME_SUBMISSION_LIMIT } from "@/services/memeService";
import MemeCreationFlow from "@/components/MemeCreation/MemeCreationFlow";
import { memeCreationText } from "@/components/MemeCreation/memeCreationText";

export default function CreateMemePage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const t = memeCreationText[lang];
  const { state: scheduleState } = useEventSchedule();
  const schedule =
    scheduleState.status === "ready" ? scheduleState.schedule : undefined;
  const { phase } = useEventPhase(schedule);
  const [submissionsUsed, setSubmissionsUsed] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/login");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;

    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const memes = await getMyMemes(token, controller.signal);
        if (!cancelled) {
          setSubmissionsUsed(
            memes.filter((meme) => !meme.isInvalidatedBySourcePhoto).length,
          );
        }
      } catch {
        // Leave the count unknown; submission errors are still handled in the flow.
      }
    }
    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn || scheduleState.status === "loading") {
    return <LoadingScreen />;
  }

  const limitReached =
    submissionsUsed !== null && submissionsUsed >= MEME_SUBMISSION_LIMIT;
  const blocked =
    phase !== "submissions"
      ? t.submitErrorClosed
      : limitReached
        ? t.submitErrorLimit
        : null;

  return (
    <div className="flex flex-1 flex-col text-midi-gray">
      <div className="mx-auto w-full max-w-[1260px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-midi-blue"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t.backToDashboard}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{t.pageTitle}</h1>
        <div className="mt-4">
          {blocked ? (
            <p
              role="alert"
              className="rounded-lg border border-white/15 bg-[#0b0f12] p-6 text-center text-sm text-white/75"
            >
              {blocked}
            </p>
          ) : (
            <MemeCreationFlow
              onViewMemes={() => router.push("/dashboard#your-memes")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
