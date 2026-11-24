import { useEffect, type RefObject } from "react";

const INTRO_PAUSE_MS = 7_000;
const ROW_PAUSE_MS = 18_000;
const ROW_TRANSITION_MS = 650;
const POSITION_TOLERANCE_PX = 1;

export function usePresentationAutoScroll(
    containerRef: RefObject<HTMLElement | null>,
    galleryRef: RefObject<HTMLElement | null>,
    enabled: boolean
) {
    useEffect(() => {
        const container = containerRef.current;
        const gallery = galleryRef.current;
        const grid = gallery?.querySelector("[data-presentation-grid]");
        if (!enabled || !container || !gallery || !grid) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let timerId: number | undefined;
        let frameId: number | undefined;

        function getStopPositions(container: HTMLElement, gallery: HTMLElement, grid: Element) {
            const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
            const firstCard = grid.firstElementChild;
            if (!firstCard || maxScroll <= POSITION_TOLERANCE_PX) return [0];

            const firstTop = firstCard.getBoundingClientRect().top;
            const galleryTop = gallery.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
            const stops = [0];
            for (const card of grid.children) {
                const top = Math.min(maxScroll, galleryTop + card.getBoundingClientRect().top - firstTop);
                if (top - stops[stops.length - 1] > POSITION_TOLERANCE_PX) stops.push(top);
            }
            return stops;
        }

        function pauseOnSlide(top: number) {
            const duration = top <= POSITION_TOLERANCE_PX ? INTRO_PAUSE_MS : ROW_PAUSE_MS;
            timerId = window.setTimeout(advance, duration);
        }

        function advance() {
            if (!container || !gallery || !grid) return;
            const currentTop = container.scrollTop;
            const stops = getStopPositions(container, gallery, grid);
            const nextTop = stops.find(top => top > currentTop + POSITION_TOLERANCE_PX);

            if (nextTop === undefined || reducedMotion.matches) {
                container.scrollTop = nextTop ?? 0;
                pauseOnSlide(nextTop ?? 0);
                return;
            }

            const viewport = container;
            const target = nextTop;
            const start = performance.now();
            function animate(now: number) {
                const progress = Math.min(1, (now - start) / ROW_TRANSITION_MS);
                const eased = progress * progress * (3 - 2 * progress);
                viewport.scrollTop = currentTop + (target - currentTop) * eased;
                if (progress < 1) frameId = window.requestAnimationFrame(animate);
                else pauseOnSlide(target);
            }
            frameId = window.requestAnimationFrame(animate);
        }

        container.scrollTop = 0;
        pauseOnSlide(0);
        return () => {
            window.clearTimeout(timerId);
            if (frameId !== undefined) window.cancelAnimationFrame(frameId);
        };
    }, [containerRef, galleryRef, enabled]);
}
