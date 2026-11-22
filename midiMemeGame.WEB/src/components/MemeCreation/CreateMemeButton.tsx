"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useEventPhase } from "@/hooks/useEventPhase";
import type { EventSchedule } from "@/services/eventScheduleService";
import { dashboardText } from "@/app/dashboard/pageText";

type CreateMemeButtonProps = {
  schedule?: EventSchedule;
  onOpen: () => void;
};

export default function CreateMemeButton({
  schedule,
  onOpen,
}: CreateMemeButtonProps) {
  return schedule ? (
    <PhaseGatedButton schedule={schedule} onOpen={onOpen} />
  ) : (
    <Button enabled={false} onOpen={onOpen} />
  );
}

function PhaseGatedButton({
  schedule,
  onOpen,
}: {
  schedule: EventSchedule;
  onOpen: () => void;
}) {
  const { phase } = useEventPhase(schedule);
  return <Button enabled={phase === "submissions"} onOpen={onOpen} />;
}

function Button({
  enabled,
  onOpen,
}: {
  enabled: boolean;
  onOpen: () => void;
}) {
  const { lang } = useLanguage();
  const t = dashboardText[lang];

  return (
    <>
      <button
        type="button"
        disabled={!enabled}
        onClick={enabled ? onOpen : undefined}
        aria-describedby={enabled ? undefined : "creation-notice"}
        className={`mt-8 inline-flex min-h-13 items-center gap-3 rounded-xl px-6 py-3 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${
          enabled
            ? "cursor-pointer bg-midi-blue text-white hover:bg-midi-blue/85"
            : "cursor-not-allowed bg-midi-blue text-white opacity-40"
        }`}
      >
        {t.createMeme}
        <ArrowRight aria-hidden="true" className="size-5" />
      </button>
      {!enabled && (
        <p id="creation-notice" className="mt-3 text-sm text-text-muted">
          {t.creationNotice}
        </p>
      )}
    </>
  );
}
