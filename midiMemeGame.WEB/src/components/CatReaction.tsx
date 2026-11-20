"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./CatReaction.module.css";

const reactions = [
  { sound: "/cats/meow-soft.mp3", lt: "Miau!", en: "Meow!" },
  { sound: "/cats/purr-1.mp3", lt: "Brrr!", en: "Brrr!" },
  { sound: "/cats/meow-long.mp3", lt: "Miaaau!", en: "Meeow!" },
] as const;

const angryReaction = { sound: "/cats/meow-angry.mp3", lt: "MIAAAAAAAAAAAU!", en: "MEEEEEOOOOW!" } as const;

type Reaction = (typeof reactions)[number] | typeof angryReaction;

const ANGRY_CAT_SPRITE = "/cats/kosmonautas-angry.svg";
const ANGER_CLICK_COUNT = 7;
const ANGER_WINDOW_MS = 1500;
const ANGER_COOLDOWN_MS = 4000;

const BUBBLE_DURATION_MS = 1800;
const INVITATION_DELAY_MS = 5000;
const invitation = { lt: "Paglostyk mane!", en: "Pet me!" };

function createSoundPlayer(angerEnabled: boolean) {
  const context = typeof AudioContext === "function" ? new AudioContext() : null;
  const preload = new AbortController();
  const buffers = new Map<Reaction["sound"], AudioBuffer>();
  let stopPlaying: (() => void) | undefined;

  if (context) {
    for (const { sound } of angerEnabled ? [...reactions, angryReaction] : reactions) {
      void fetch(sound, { signal: preload.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Cat sound unavailable");
          return response.arrayBuffer();
        })
        .then((bytes) => context.decodeAudioData(bytes))
        .then((buffer) => {
          if (!preload.signal.aborted) buffers.set(sound, buffer);
        })
        .catch(() => {
          // A tap can still use the media element if preloading fails.
        });
    }
  }

  return {
    play(sound: Reaction["sound"]) {
      stopPlaying?.();
      const buffer = buffers.get(sound);
      if (context && buffer) {
        if (context.state !== "running") {
          // Unlock audio inside the button's user gesture.
          void context.resume().catch(() => {});
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => source.disconnect();
        source.start();
        stopPlaying = () => source.stop();
      } else {
        const clip = new Audio(sound);
        void clip.play().catch(() => {});
        stopPlaying = () => clip.pause();
      }
    },
    dispose() {
      preload.abort();
      stopPlaying?.();
      if (context) void context.close().catch(() => {});
    },
  };
}

export function CatReaction({
  className = "",
  hovering = false,
  angerEnabled = false,
}: {
  className?: string;
  hovering?: boolean;
  angerEnabled?: boolean;
}) {
  const { lang } = useLanguage();
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [showInvitation, setShowInvitation] = useState(false);
  const nextReaction = useRef(0);
  const recentClicks = useRef<number[]>([]);
  const coolingDown = useRef(false);
  const isAngry = reaction === angryReaction;
  const invitationTimeout = useRef<number | undefined>(undefined);
  const reactionTimeout = useRef<number | undefined>(undefined);
  const player = useRef<ReturnType<typeof createSoundPlayer> | null>(null);

  useEffect(() => {
    invitationTimeout.current = window.setTimeout(() => setShowInvitation(true), INVITATION_DELAY_MS);
    const soundPlayer = createSoundPlayer(angerEnabled);
    player.current = soundPlayer;
    if (angerEnabled) {
      const angrySprite = new window.Image();
      angrySprite.src = ANGRY_CAT_SPRITE;
    }

    return () => {
      window.clearTimeout(invitationTimeout.current);
      window.clearTimeout(reactionTimeout.current);
      soundPlayer.dispose();
      player.current = null;
    };
  }, [angerEnabled]);

  function react() {
    if (coolingDown.current) return;

    if (angerEnabled) {
      const now = performance.now();
      const clicks = recentClicks.current.filter((time) => now - time <= ANGER_WINDOW_MS);
      clicks.push(now);
      recentClicks.current = clicks;

      if (clicks.length >= ANGER_CLICK_COUNT) {
        coolingDown.current = true;
        recentClicks.current = [];
      }
    }

    const next = coolingDown.current ? angryReaction : reactions[nextReaction.current];
    if (!coolingDown.current) {
      nextReaction.current = (nextReaction.current + 1) % reactions.length;
    }

    player.current?.play(next.sound);
    window.clearTimeout(invitationTimeout.current);
    setShowInvitation(false);

    setReaction(next);
    window.clearTimeout(reactionTimeout.current);
    reactionTimeout.current = window.setTimeout(() => {
      coolingDown.current = false;
      setReaction(null);
    }, coolingDown.current ? ANGER_COOLDOWN_MS : BUBBLE_DURATION_MS);
  }

  return (
    <div className={`${styles.reaction} ${hovering ? styles.hovering : ""} ${className}`}>
      <button
        type="button"
        aria-label={lang === "lt" ? "MIDI katinas: pamiauk" : "MIDI cat: meow"}
        aria-disabled={isAngry || undefined}
        className={styles.button}
        onClick={react}
      >
        <span className={styles.cat} data-cat-sprite>
          <Image
            src={isAngry ? ANGRY_CAT_SPRITE : "/cats/kosmonautas.svg"}
            alt=""
            width={160}
            height={160}
            draggable={false}
          />
          {isAngry && <span aria-hidden="true" className={styles.angerMarks} />}
        </span>
      </button>
      <span role="status" className={styles.status} data-angry={isAngry || undefined}>
        {showInvitation && <span key="invitation" className={styles.cloud}>{invitation[lang]}</span>}
        {reaction && <span key={reaction.sound} className={styles.cloud}>{reaction[lang]}</span>}
      </span>
    </div>
  );
}
