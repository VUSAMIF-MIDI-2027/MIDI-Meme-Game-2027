"use client";

import { useEffect, useRef } from "react";

export type FlightStartSide = "left" | "right";

type Position = { x: number; y: number };
type Obstacle = { left: number; top: number; right: number; bottom: number };

const MOBILE_QUERY = "(max-width: 639px)";
const RULES_OVERLAP_QUERY = "(width < 64rem), (pointer: coarse)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const OBSTACLE_GAP = 6;
const POSITION_SEARCH_STEP = 8;
const MAX_FRAME_SECONDS = 0.05;
const TURN_LOOKAHEAD_SECONDS = 1.2;
const TURN_SMOOTHING = 2;
const FLIGHT_SPEED = { x: 17, y: 11 };
// The furthest visible point in the spinning sprite is 46% of its width from its center.
const SPRITE_RADIUS_RATIO = 0.46;

// Only the visible pixels collide; the SVG has transparent margins.
const SPRITE_BOUNDS = { left: 0.175, right: 0.9, top: 0.2, bottom: 0.925 };

function collectObstacles(
  content: HTMLElement,
  flightArea: HTMLElement,
): Obstacle[] {
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

    if (!node.textContent?.trim() || isDecoration || flightArea.contains(node)) continue;

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
  startSide: FlightStartSide,
  bounceOnContact: boolean,
) {
  const overlapScreen = window.matchMedia(bounceOnContact ? RULES_OVERLAP_QUERY : MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const position = { x: 0, y: 0 };
  const startsOnLeft = startSide === "left";
  const targetVelocity = { x: startsOnLeft ? FLIGHT_SPEED.x : -FLIGHT_SPEED.x, y: FLIGHT_SPEED.y };
  const velocity = { ...targetVelocity };
  let maxX = 0;
  let maxY = 0;
  let catSize = 100;
  let obstacles: Obstacle[] = [];
  let canPlaceCat = true;
  let initialized = false;
  let disposed = false;
  let visible = true;
  let animationFrame = 0;
  let previousFrameTime = 0;

  function hitsObstacle(x: number, y: number) {
    if (bounceOnContact) {
      const centerX = x + catSize / 2;
      const centerY = y + catSize / 2;
      const radius = catSize * SPRITE_RADIUS_RATIO;

      return obstacles.some(({ left, top, right, bottom }) => {
        const dx = Math.max(left - centerX, 0, centerX - right);
        const dy = Math.max(top - centerY, 0, centerY - bottom);
        return dx * dx + dy * dy < radius * radius;
      });
    }

    const rotationMargin = catSize * 0.07;
    const left = x + catSize * SPRITE_BOUNDS.left - rotationMargin;
    const right = x + catSize * SPRITE_BOUNDS.right + rotationMargin;
    const top = y + catSize * SPRITE_BOUNDS.top - rotationMargin;
    const bottom = y + catSize * SPRITE_BOUNDS.bottom + rotationMargin;

    return obstacles.some((obstacle) => (
      left < obstacle.right && right > obstacle.left &&
      top < obstacle.bottom && bottom > obstacle.top
    ));
  }

  function paintPosition() {
    // Keep fractional positions so slow flight does not jump one pixel at a time.
    cat.style.transform = `translate3d(${position.x.toFixed(3)}px, ${position.y.toFixed(3)}px, 0)`;
  }

  function isBlocked(x: number, y: number) {
    return x < 0 || x > maxX || y < 0 || y > maxY || hitsObstacle(x, y);
  }

  function findNearestClearPosition(): Position | undefined {
    let nearest: Position | undefined;
    let nearestDistance = Infinity;

    for (let row = 0; row <= Math.ceil(maxY / POSITION_SEARCH_STEP); row++) {
      const y = Math.min(row * POSITION_SEARCH_STEP, maxY);
      if ((y - position.y) ** 2 >= nearestDistance) continue;

      for (let column = 0; column <= Math.ceil(maxX / POSITION_SEARCH_STEP); column++) {
        const x = Math.min(column * POSITION_SEARCH_STEP, maxX);
        const distance = (x - position.x) ** 2 + (y - position.y) ** 2;
        if (distance < nearestDistance && !hitsObstacle(x, y)) {
          nearest = { x, y };
          nearestDistance = distance;
        }
      }
    }

    return nearest;
  }

  function placeCat() {
    if (!initialized) {
      position.x = maxX * (startsOnLeft ? 0.05 : 0.95);
      position.y = bounceOnContact ? Math.min(maxY, 32) : maxY * 0.18;
      initialized = true;
    }
    position.x = Math.max(0, Math.min(maxX, position.x));
    position.y = Math.max(0, Math.min(maxY, position.y));

    // Text can move over the cat after resizing, loading fonts or switching language.
    canPlaceCat = true;
    if (hitsObstacle(position.x, position.y)) {
      const clearPosition = findNearestClearPosition();
      if (clearPosition) Object.assign(position, clearPosition);
      else canPlaceCat = !bounceOnContact;
    }

    if (bounceOnContact) cat.style.visibility = canPlaceCat ? "" : "hidden";
    paintPosition();
  }

  function measureLayout() {
    if (disposed) return;

    catSize = cat.offsetWidth;
    maxX = Math.max(0, flightArea.clientWidth - catSize);
    maxY = Math.max(0, flightArea.clientHeight - catSize);

    obstacles = overlapScreen.matches ? [] : collectObstacles(content, flightArea);
    placeCat();
  }

  function bounceOffObstacles(elapsed: number) {
    const nextX = position.x + velocity.x * elapsed;
    if (isBlocked(nextX, position.y)) velocity.x *= -1;
    else position.x = nextX;

    const nextY = position.y + velocity.y * elapsed;
    if (isBlocked(position.x, nextY)) velocity.y *= -1;
    else position.y = nextY;
  }

  function animate(now: number) {
    const elapsed = previousFrameTime
      ? Math.min((now - previousFrameTime) / 1000, MAX_FRAME_SECONDS)
      : 0;
    previousFrameTime = now;

    if (bounceOnContact) {
      if (canPlaceCat) {
        bounceOffObstacles(elapsed);
        paintPosition();
      }
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    // Start turning before contact, and avoid flipping directions every frame
    // when a narrow gap blocks both lookahead probes.
    const lookaheadX = targetVelocity.x * TURN_LOOKAHEAD_SECONDS;
    if (
      isBlocked(position.x + lookaheadX, position.y) &&
      !isBlocked(position.x - lookaheadX, position.y)
    ) {
      targetVelocity.x *= -1;
    }

    const lookaheadY = targetVelocity.y * TURN_LOOKAHEAD_SECONDS;
    if (
      isBlocked(position.x, position.y + lookaheadY) &&
      !isBlocked(position.x, position.y - lookaheadY)
    ) {
      targetVelocity.y *= -1;
    }

    const turnAmount = 1 - Math.exp(-TURN_SMOOTHING * elapsed);
    velocity.x += (targetVelocity.x - velocity.x) * turnAmount;
    velocity.y += (targetVelocity.y - velocity.y) * turnAmount;

    const nextX = position.x + velocity.x * elapsed;
    if (isBlocked(nextX, position.y)) {
      targetVelocity.x = velocity.x > 0 ? -FLIGHT_SPEED.x : FLIGHT_SPEED.x;
      velocity.x = 0;
    } else position.x = nextX;

    const nextY = position.y + velocity.y * elapsed;
    if (isBlocked(position.x, nextY)) {
      targetVelocity.y = velocity.y > 0 ? -FLIGHT_SPEED.y : FLIGHT_SPEED.y;
      velocity.y = 0;
    } else position.y = nextY;

    paintPosition();
    animationFrame = requestAnimationFrame(animate);
  }

  function updatePlayback() {
    cancelAnimationFrame(animationFrame);
    previousFrameTime = 0;
    const flying = visible && !reducedMotion.matches && !document.hidden;
    cat.toggleAttribute("data-flying", flying);

    if (flying) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  const resizeObserver = new ResizeObserver(measureLayout);
  resizeObserver.observe(flightArea);
  resizeObserver.observe(cat);
  content.querySelectorAll("img, h1, p").forEach((element) => {
    if (!flightArea.contains(element)) resizeObserver.observe(element);
  });

  const textObserver = new MutationObserver((records) => {
    // The reaction bubble moves with the cat and cannot be a flight obstacle.
    if (!overlapScreen.matches && records.some(({ target }) => !flightArea.contains(target))) {
      measureLayout();
    }
  });
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
  overlapScreen.addEventListener("change", measureLayout);
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
    overlapScreen.removeEventListener("change", measureLayout);
    reducedMotion.removeEventListener("change", updatePlayback);
    document.removeEventListener("visibilitychange", updatePlayback);
  };
}

export function useFlyingCatMotion(
  startSide: FlightStartSide,
  bounceOnContact: boolean,
) {
  const flightAreaRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flightArea = flightAreaRef.current;
    const cat = catRef.current;
    const content = flightArea?.parentElement;
    if (!flightArea || !cat || !content) return;

    return startFlyingCatMotion(flightArea, cat, content, startSide, bounceOnContact);
  }, [startSide, bounceOnContact]);

  return { flightAreaRef, catRef };
}
