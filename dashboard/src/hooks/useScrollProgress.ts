'use client';

import { useEffect } from 'react';

/*
  Writes how far the document has been scrolled, as a 0-1 fraction, to --scroll-progress
  on <html> so the header rail can render it in pure CSS.

  Same shape as usePointerGlow and useScrollParallax: one delegated listener coalesced to
  a single style write per frame.

  Not gated on reduced motion. The rail is a position readout rather than decoration, and
  freezing it at 0 would leave a permanently empty bar reporting the wrong position. It
  animates nothing on its own; it only tracks a value the user is already changing.
*/
export function useScrollProgress(): void {
  useEffect(() => {
    const root: HTMLElement = document.documentElement;
    let frame = 0;

    const flush = (): void => {
      frame = 0;
      // Total distance the document can travel. Zero on a page that does not scroll.
      const scrollable = root.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty('--scroll-progress', String(Math.min(1, Math.max(0, progress))));
    };

    const schedule = (): void => {
      if (frame === 0) frame = requestAnimationFrame(flush);
    };

    flush();
    window.addEventListener('scroll', schedule, { passive: true });
    // Panels expand and collapse under the user, which changes scrollHeight without a scroll.
    window.addEventListener('resize', schedule, { passive: true });

    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);
}
