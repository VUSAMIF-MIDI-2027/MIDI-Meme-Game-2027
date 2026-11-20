"use client";

import { CatReaction } from "./CatReaction";
import { useFlyingCatMotion, type FlightStartSide } from "./useFlyingCatMotion";
import styles from "./FlyingCat.module.css";

export function FlyingCat({
  startSide = "right",
  bounceOnContact = false,
}: {
  startSide?: FlightStartSide;
  bounceOnContact?: boolean;
}) {
  const { flightAreaRef, catRef } = useFlyingCatMotion(startSide, bounceOnContact);

  return (
    <div ref={flightAreaRef} className={bounceOnContact ? `${styles.sky} ${styles.sectionSky}` : styles.sky}>
      <div ref={catRef} className={styles.flight}>
        <CatReaction angerEnabled />
      </div>
    </div>
  );
}
