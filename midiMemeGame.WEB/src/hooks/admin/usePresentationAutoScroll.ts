import { useEffect, type RefObject } from "react";

const SCROLL_SPEED_PX_PER_S = 35;
const BOTTOM_PAUSE_MS = 4_000;
const TOP_PAUSE_MS = 3_000;
const RETURN_MIN_MS = 800;
const RETURN_MAX_MS = 3_000;
const RETURN_PX_PER_S = 600;
const MAX_FRAME_MS = 100;
const FIT_TOLERANCE_PX = 1;

type Phase = "down" | "bottomPause" | "up" | "topPause";

/**
 * Slowly scrolls a container down, pauses, eases back to the top, pauses and repeats.
 * Everything is derived from the live scrollHeight each frame, so data refreshes and
 * resizes never reset the position. `enabled` must be true only once the container
 * is mounted. Does nothing when the content fits or when the
 * user prefers reduced motion.
 */
export function usePresentationAutoScroll(
    containerRef: RefObject<HTMLElement | null>,
    enabled: boolean
) {
    useEffect(() => {
        const element = containerRef.current;
        if (!enabled || !element) return;
        const container: HTMLElement = element;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let frameId = 0;
        let lastTime = 0;
        let phase: Phase = "topPause";
        let waitUntil = 0;
        let position = container.scrollTop;
        let returnFrom = 0;
        let returnStart = 0;
        let returnDuration = RETURN_MIN_MS;

        function enterPhase(next: Phase, now: number) {
            phase = next;
            if (next === "topPause") waitUntil = now + TOP_PAUSE_MS;
            if (next === "bottomPause") waitUntil = now + BOTTOM_PAUSE_MS;
            if (next === "up") {
                returnFrom = position;
                returnStart = now;
                returnDuration = Math.min(
                    RETURN_MAX_MS,
                    Math.max(RETURN_MIN_MS, (returnFrom / RETURN_PX_PER_S) * 1000)
                );
            }
        }

        function frame(now: number) {
            const delta = lastTime === 0 ? 0 : Math.min(now - lastTime, MAX_FRAME_MS);
            lastTime = now;
            const maxScroll = container.scrollHeight - container.clientHeight;

            if (reducedMotion.matches || maxScroll <= FIT_TOLERANCE_PX) {
                position = 0;
                if (container.scrollTop !== 0) container.scrollTop = 0;
                if (phase !== "topPause") enterPhase("topPause", now);
                else waitUntil = now + TOP_PAUSE_MS;
            } else {
                position = Math.min(position, maxScroll);

                if (phase === "topPause" && now >= waitUntil) {
                    enterPhase("down", now);
                } else if (phase === "down") {
                    position = Math.min(maxScroll, position + (SCROLL_SPEED_PX_PER_S * delta) / 1000);
                    if (position >= maxScroll) enterPhase("bottomPause", now);
                } else if (phase === "bottomPause" && now >= waitUntil) {
                    enterPhase("up", now);
                } else if (phase === "up") {
                    const progress = Math.min(1, (now - returnStart) / returnDuration);
                    const eased = progress * progress * (3 - 2 * progress);
                    position = Math.min(returnFrom, maxScroll) * (1 - eased);
                    if (progress >= 1) {
                        position = 0;
                        enterPhase("topPause", now);
                    }
                }

                container.scrollTop = position;
            }

            frameId = window.requestAnimationFrame(frame);
        }

        enterPhase("topPause", performance.now());
        frameId = window.requestAnimationFrame(frame);

        return () => window.cancelAnimationFrame(frameId);
    }, [containerRef, enabled]);
}
