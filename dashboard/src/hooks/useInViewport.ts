'use client';

import { RefObject, useEffect, useState } from 'react';

export interface UseInViewportOptions {
  /* Margin around the root, same syntax as IntersectionObserver rootMargin. */
  rootMargin?: string;
  threshold?: number;
  /* Stop observing after the first time the element enters. */
  once?: boolean;
}

/*
  Reports whether an element is currently in the viewport. Used to gate animation
  loops so nothing burns frames offscreen, per the WebGL budget in docs/Context.md.
*/
export function useInViewport(
  ref: RefObject<Element | null>,
  { rootMargin = '0px', threshold = 0, once = false }: UseInViewportOptions = {},
): boolean {
  const [inViewport, setInViewport] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Without IntersectionObserver, assume visible rather than silently never animating.
    if (typeof IntersectionObserver === 'undefined') {
      setInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        setInViewport(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inViewport;
}
