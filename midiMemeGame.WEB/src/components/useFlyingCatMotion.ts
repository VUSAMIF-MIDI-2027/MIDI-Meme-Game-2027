"use client";

import { useEffect, useRef } from "react";

type Position = { x: number; y: number };
type Obstacle = { left: number; top: number; right: number; bottom: number };

const MOBILE_QUERY = "(max-width: 639px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const OBSTACLE_GAP = 6;
const POSITION_SEARCH_STEP = 8;
const MAX_FRAME_SECONDS = 0.05;

// Only the visible pixels collide; the SVG has transparent margins.
const SPRITE_BOUNDS = { left: 0.175, right: 0.9, top: 0.2, bottom: 0.925 };

function collectObstacles(content: HTMLElement, flightArea: HTMLElement): Obstacle[] {
  const areaBounds = flightArea.getBoundingClientRect();
  const obstacles: Obstacle[] = [];

  function addObstacle(rect: DOMRect) {
    if (!rect.width || !rect.height) return;

    obstacles.push({
      left: rect.left - areaBounds.left - OBSTACLE_GAP,
      top: rect.top - areaBounds.top - OBSTACLE_GAP,
      right: rect.right - areaBounds.left + OBSTACLE_GAP,
      bottom: rect.bottom - areaBounds.top + OBSTACLE_GAP,
    });
  }

  const textNodes = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  const textRange = document.createRange();

  while (textNodes.nextNode()) {
    const node = textNodes.currentNode;
    const isDecoration = node.parentElement?.closest(
      '[aria-hidden="true"], script, style',
    );

    if (!node.textContent?.trim() || isDecoration) continue;

    textRange.selectNodeContents(node);
    for (const rect of textRange.getClientRects()) addObstacle(rect);
  }

  // Protect the logo, but allow flight over decorative images such as the moon.
  content.querySelectorAll('img:not([aria-hidden="true"])').forEach((image) => {
    if (!flightArea.contains(image)) addObstacle(image.getBoundingClientRect());
  });

  return obstacles;
}

function startFlyingCatMotion(
  flightArea: HTMLDivElement,
  cat: HTMLDivElement,
  content: HTMLElement,
) {
  const mobileScreen = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const position = { x: 0, y: 0 };
  const velocity = { x: -18, y: 12 };
  let maxX = 0;
  let maxY = 0;
  let catSize = 100;
  let obstacles: Obstacle[] = [];
  let initialized = false;
  let disposed = false;
  let visible = true;
  let animationFrame = 0;
  let previousFrameTime = 0;

  function hitsObstacle(x: number, y: number) {
    const left = x + catSize * SPRITE_BOUNDS.left;
    const right = x + catSize * SPRITE_BOUNDS.right;
    const top = y + catSize * SPRITE_BOUNDS.top;
    const bottom = y + catSize * SPRITE_BOUNDS.bottom;

    return obstacles.some((obstacle) => (
      left < obstacle.right && right > obstacle.left &&
      top < obstacle.bottom && bottom > obstacle.top
    ));
  }

  function paintPosition() {
    if (!initialized) {
      position.x = maxX * 0.95;
      position.y = maxY * 0.18;
      initialized = true;
    }

    if (position.x <= 0) velocity.x = Math.abs(velocity.x);
    if (position.x >= maxX) velocity.x = -Math.abs(velocity.x);
    if (position.y <= 0) velocity.y = Math.abs(velocity.y);
    if (position.y >= maxY) velocity.y = -Math.abs(velocity.y);

    position.x = Math.max(0, Math.min(maxX, position.x));
    position.y = Math.max(0, Math.min(maxY, position.y));

    // Integer coordinates keep the pixel artwork sharp.
    cat.style.transform = `translate(${Math.round(position.x)}px, ${Math.round(position.y)}px)`;
  }

  function findNearestClearPosition(): Position | undefined {
    let nearest: Position | undefined;
    let nearestDistance = Infinity;

    for (let y = 0; y <= maxY; y += POSITION_SEARCH_STEP) {
      for (let x = 0; x <= maxX; x += POSITION_SEARCH_STEP) {
        const distance = (x - position.x) ** 2 + (y - position.y) ** 2;
        if (distance < nearestDistance && !hitsObstacle(x, y)) {
          nearest = { x, y };
          nearestDistance = distance;
        }
      }
    }

    return nearest;
  }

  function measureLayout() {
    if (disposed) return;

    catSize = cat.offsetWidth;
    maxX = Math.max(0, flightArea.clientWidth - catSize);
    maxY = Math.max(0, flightArea.clientHeight - catSize);
    obstacles = mobileScreen.matches ? [] : collectObstacles(content, flightArea);
    paintPosition();

    // Text can move over the cat after resizing, loading fonts or switching language.
    if (hitsObstacle(position.x, position.y)) {
      const clearPosition = findNearestClearPosition();
      if (clearPosition) Object.assign(position, clearPosition);
    }

    paintPosition();
  }

  function animate(now: number) {
    const elapsed = previousFrameTime
      ? Math.min((now - previousFrameTime) / 1000, MAX_FRAME_SECONDS)
      : 0;
    previousFrameTime = now;

    const nextX = position.x + velocity.x * elapsed;
    if (hitsObstacle(nextX, position.y)) velocity.x *= -1;
    else position.x = nextX;

    const nextY = position.y + velocity.y * elapsed;
    if (hitsObstacle(position.x, nextY)) velocity.y *= -1;
    else position.y = nextY;

    paintPosition();
    animationFrame = requestAnimationFrame(animate);
  }

  function updatePlayback() {
    cancelAnimationFrame(animationFrame);
    previousFrameTime = 0;

    if (visible && !reducedMotion.matches && !document.hidden) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  const resizeObserver = new ResizeObserver(measureLayout);
  resizeObserver.observe(flightArea);
  content.querySelectorAll("img, h1, p").forEach((element) => {
    resizeObserver.observe(element);
  });

  const textObserver = new MutationObserver(measureLayout);
  textObserver.observe(content, {
    subtree: true,
    characterData: true,
    childList: true,
  });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
  });
  visibilityObserver.observe(flightArea);

  content.addEventListener("load", measureLayout, true);
  mobileScreen.addEventListener("change", measureLayout);
  reducedMotion.addEventListener("change", updatePlayback);
  document.addEventListener("visibilitychange", updatePlayback);
  document.fonts.ready.then(measureLayout);

  measureLayout();
  updatePlayback();

  return () => {
    disposed = true;
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    textObserver.disconnect();
    visibilityObserver.disconnect();
    content.removeEventListener("load", measureLayout, true);
    mobileScreen.removeEventListener("change", measureLayout);
    reducedMotion.removeEventListener("change", updatePlayback);
    document.removeEventListener("visibilitychange", updatePlayback);
  };
}

export function useFlyingCatMotion() {
  const flightAreaRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flightArea = flightAreaRef.current;
    const cat = catRef.current;
    const content = flightArea?.parentElement;
    if (!flightArea || !cat || !content) return;

    return startFlyingCatMotion(flightArea, cat, content);
  }, []);

  return { flightAreaRef, catRef };
}
