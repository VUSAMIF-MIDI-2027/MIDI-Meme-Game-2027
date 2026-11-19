"use client";

import { CatReaction } from "./CatReaction";
import { useFlyingCatMotion } from "./useFlyingCatMotion";
import styles from "./FlyingCat.module.css";

export function FlyingCat() {
  const { flightAreaRef, catRef } = useFlyingCatMotion();

  return (
    <div ref={flightAreaRef} className={styles.sky}>
      <div ref={catRef} className={styles.flight}>
        <CatReaction />
      </div>
    </div>
  );
}
