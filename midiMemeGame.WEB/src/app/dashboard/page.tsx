"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import YourMemes from "@/components/Home/Your-Memes/YourMemes";
import { CompetitionStatus } from "@/components/Shared/CompetitionStatus";
import CreateMemeButton from "@/components/MemeCreation/CreateMemeButton";
import MemeCreationModal from "@/components/MemeCreation/MemeCreationModal";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import type { EventSchedule } from "@/services/eventScheduleService";
import { useLanguage } from "@/context/LanguageContext";
import { dashboardText } from "./pageText";
import styles from "./dashboard.module.css";
import Link from "next/link";

// TEMP: forced submissions window for local testing — revert before merge
const devSchedule: EventSchedule = {
  eventStartsAt: new Date(Date.now() - 3600_000).toISOString(),
  votingStartsAt: new Date(Date.now() + 86400_000).toISOString(),
  eventEndsAt: new Date(Date.now() + 2 * 86400_000).toISOString(),
};

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { lang } = useLanguage();
  const router = useRouter();
  const t = dashboardText[lang];
  const { state: scheduleState, retry: retrySchedule } = useEventSchedule();
  const schedule = devSchedule;
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/login");
  }, [isLoaded, isSignedIn, router]);

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
              onOpen={() => setModalOpen(true)}
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

        <YourMemes />
        <Link
          href="/rules"
          className="mt-6 inline-flex min-h-11 items-center text-sm text-white/80 underline underline-offset-4 hover:text-white"
        >
          {lang === "lt" ? "Konkurso taisyklės" : "Competition rules"}
        </Link>
      </div>
      {modalOpen && (
        <MemeCreationModal
          onClose={() => setModalOpen(false)}
          onViewMemes={() => {
            setModalOpen(false);
            document
              .getElementById("your-memes")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
