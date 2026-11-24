"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import YourMemes, {
  type MemeStatus,
  type YourMeme,
} from "@/components/Home/Your-Memes/YourMemes";
import { CompetitionStatus } from "@/components/Shared/CompetitionStatus";
import CreateMemeButton from "@/components/MemeCreation/CreateMemeButton";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import {
  deleteMeme,
  getMyMemes,
  MEME_STATUS_APPROVED,
  MEME_STATUS_PENDING,
  MEME_STATUS_REJECTED,
  MEME_SUBMISSION_LIMIT,
  updateMemeCaption,
} from "@/services/memeService";
import { getPhotoBlob } from "@/services/userService";
import { useLanguage } from "@/context/LanguageContext";
import { dashboardText } from "./pageText";
import styles from "./dashboard.module.css";
import Link from "next/link";

const statusById: Record<number, MemeStatus> = {
  [MEME_STATUS_PENDING]: "pending",
  [MEME_STATUS_REJECTED]: "rejected",
  [MEME_STATUS_APPROVED]: "approved",
};

// Sqlite DateTime values serialize without a zone suffix; treat them as UTC.
function asUtc(iso: string) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : iso + "Z";
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();
  const t = dashboardText[lang];
  const { state: scheduleState, retry: retrySchedule } = useEventSchedule();
  const schedule =
    scheduleState.status === "ready" ? scheduleState.schedule : undefined;
  const [myMemes, setMyMemes] = useState<YourMeme[]>([]);
  const [submissionsUsed, setSubmissionsUsed] = useState(0);
  const [memesRefresh, setMemesRefresh] = useState(0);
  const imageUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isSignedIn) return;

    const controller = new AbortController();
    let cancelled = false;
    const createdUrls: string[] = [];

    async function load() {
      try {
        const token = await getToken();
        if (!token) return;

        const list = await getMyMemes(token, controller.signal);
        // Deleting frees the slot and invalidated memes never count, so
        // this matches the server-side submission count exactly.
        const used = list.filter(
          (meme) => !meme.isInvalidatedBySourcePhoto,
        ).length;
        const entries = await Promise.all(
          list.map(async (meme) => {
            try {
              const blob = await getPhotoBlob(
                meme.sourcePhotoId,
                token,
                controller.signal,
              );
              const url = URL.createObjectURL(blob);
              createdUrls.push(url);
              return {
                id: meme.id,
                image: url,
                sourcePhotoId: meme.sourcePhotoId,
                caption: meme.caption,
                submittedAt: asUtc(meme.createdAtUtc),
                status: statusById[meme.statusId] ?? "pending",
                isInvalidated: meme.isInvalidatedBySourcePhoto,
              };
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) {
          createdUrls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }
        imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        imageUrlsRef.current = createdUrls;
        setSubmissionsUsed(used);
        setMyMemes(entries.filter((e): e is YourMeme => e !== null));
      } catch {
        // Keep whatever list is already shown.
      }
    }
    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isSignedIn, getToken, memesRefresh]);

  // Revoke the live object-url batch only on unmount — during refreshes the
  // previous batch is revoked above, after its replacement is committed.
  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/login");
  }, [isLoaded, isSignedIn, router]);

  async function handleSaveCaption(id: number, caption: string) {
    const token = await getToken();
    if (!token) throw new Error("Missing session token.");
    await updateMemeCaption(id, caption, token);
    setMemesRefresh((value) => value + 1);
  }

  async function handleDelete(id: number) {
    const token = await getToken();
    if (!token) throw new Error("Missing session token.");
    await deleteMeme(id, token);
    setMemesRefresh((value) => value + 1);
  }

  if (!isLoaded || !isSignedIn || !isUserLoaded) return <LoadingScreen />;

  const name = user?.firstName?.trim() || user?.username?.trim();

  return (
    <div className={`${styles.page} flex flex-1 flex-col text-midi-gray`}>
      <div className="mx-auto w-full max-w-[1260px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:pt-20 lg:pb-24">
        <section
          aria-labelledby="participant-title"
          className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] lg:gap-16"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">
              {name ? `${t.greeting}, ${name}` : `${t.greeting}!`}
            </p>
            <h1
              id="participant-title"
              className="mt-5 max-w-[760px] text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-pretty"
            >
              {t.title}
            </h1>
            <p className="mt-6 max-w-[720px] text-base leading-[1.75] text-text-muted sm:text-lg">
              {t.description}
            </p>
            <CreateMemeButton
              schedule={schedule}
              limitReached={submissionsUsed >= MEME_SUBMISSION_LIMIT}
              onOpen={() => router.push("/dashboard/create")}
            />
          </div>

          <div>
            <div className={styles.catScene} aria-hidden="true">
              <span className={styles.dioCat} />
            </div>
            <CompetitionStatus
              layout="dashboard"
              scheduleState={scheduleState}
              onRetry={retrySchedule}
              className="relative border-t border-midi-blue/60 pt-5"
            />
          </div>
        </section>

        <YourMemes
          memes={myMemes}
          schedule={schedule}
          onSaveCaption={handleSaveCaption}
          onDelete={handleDelete}
        />
        {myMemes.length > 0 && (
          <Link
            href="/rules"
            className="mt-6 inline-flex min-h-11 items-center text-sm text-white/80 underline underline-offset-4 hover:text-white"
          >
            {lang === "lt" ? "Konkurso taisyklės" : "Competition rules"}
          </Link>
        )}
      </div>
    </div>
  );
}
