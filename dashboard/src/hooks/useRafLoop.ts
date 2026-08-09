'use client';

import { useEffect, useRef } from 'react';

export type RafCallback = (deltaSeconds: number, elapsedSeconds: number) => void;

export interface UseRafLoopOptions {
  /*
    Caller-controlled gate. Compose it from useInViewport and usePrefersReducedMotion,
    e.g. `enabled: inViewport && !prefersReduced`. The loop also stops on its own when
    the tab is hidden, which the caller does not need to think about.
  */
  enabled?: boolean;
  /* Upper bound on a single frame's delta, so a backgrounded tab cannot resume with a huge jump. */
  maxDeltaSeconds?: number;
}

/*
  The one requestAnimationFrame loop implementation. Every canvas and WebGL component
  uses it instead of hand-rolling rAF, which is what let the upstream React Bits sources
  keep animating offscreen and in background tabs.

  The callback is held in a ref, so a caller passing an inline arrow function does not
  restart the loop on every render.
*/
export function useRafLoop(
  callback: RafCallback,
  { enabled = true, maxDeltaSeconds = 0.05 }: UseRafLoopOptions = {},
): void {
  const callbackRef = useRef<RafCallback>(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    let running = false;

    const tick = (now: number): void => {
      frame = requestAnimationFrame(tick);
      const delta = Math.min((now - last) / 1000, maxDeltaSeconds);
      last = now;
      elapsed += delta;
      callbackRef.current(delta, elapsed);
    };

    const start = (): void => {
      if (running) return;
      running = true;
      // Reset the clock so time spent paused is not billed to the next frame.
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const stop = (): void => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    const onVisibilityChange = (): void => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, maxDeltaSeconds]);
}
