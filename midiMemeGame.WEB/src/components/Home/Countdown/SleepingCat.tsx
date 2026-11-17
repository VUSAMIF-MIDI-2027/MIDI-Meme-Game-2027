import styles from "./SleepingCat.module.css";

const FRAME_SIZE = 60;
const FRAME_COUNT = 32;

export function SleepingCat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${FRAME_SIZE} ${FRAME_SIZE}`}
      width={240}
      height={240}
      aria-hidden="true"
      focusable="false"
      className={`${styles.cat} ${className}`}
    >
      <image
        href="/cats/sleepy-sprite.png"
        width={FRAME_SIZE * FRAME_COUNT}
        height={FRAME_SIZE}
        className={styles.frames}
      />
    </svg>
  );
}
