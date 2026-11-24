"use client";

import Image from "next/image";
import { CatReaction } from "./CatReaction";
import { useFlyingCatMotion, type FlightStartSide } from "./useFlyingCatMotion";
import styles from "./FlyingCat.module.css";

export function FlyingCat({
  startSide = "right",
  bounceOnContact = false,
  interactive = true,
}: {
  startSide?: FlightStartSide;
  bounceOnContact?: boolean;
  interactive?: boolean;
}) {
  const { flightAreaRef, catRef } = useFlyingCatMotion(startSide, bounceOnContact);

  return (
    <div ref={flightAreaRef} className={bounceOnContact ? `${styles.sky} ${styles.sectionSky}` : styles.sky}>
      <div ref={catRef} className={styles.flight} aria-hidden={!interactive || undefined}>
        {interactive ? (
          <CatReaction angerEnabled />
        ) : (
          <Image
            src="/cats/kosmonautas.svg"
            alt=""
            width={160}
            height={160}
            draggable={false}
            data-cat-sprite
            className="size-full object-contain [image-rendering:pixelated]"
          />
        )}
      </div>
    </div>
  );
}
