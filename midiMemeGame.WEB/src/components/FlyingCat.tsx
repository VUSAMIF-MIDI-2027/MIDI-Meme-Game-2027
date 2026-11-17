"use client";

import Image from "next/image";
import { useFlyingCatMotion } from "./useFlyingCatMotion";
import styles from "./FlyingCat.module.css";

export function FlyingCat() {
  const { flightAreaRef, catRef } = useFlyingCatMotion();

  return (
    <div ref={flightAreaRef} className={styles.sky} aria-hidden="true">
      <div ref={catRef} className={styles.flight}>
        <Image
          src="/cats/kosmonautas.svg"
          alt=""
          width={160}
          height={160}
          draggable={false}
          className={styles.cat}
        />
      </div>
    </div>
  );
}
