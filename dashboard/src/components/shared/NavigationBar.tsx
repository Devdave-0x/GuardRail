'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MdMenu, MdClose } from 'react-icons/md';
import { AnimatePresence, motion } from 'motion/react';
import { AppLogo } from '@/components/shared/AppLogo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MARKETING_NAV } from '@/lib/marketing-stats';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { DURATION, EASE_OUT } from '@/lib/motion-presets';
import { cn } from '@/lib/utils';

// === Component

/*
  Marketing-route navigation. Deliberately does not import wagmi or RainbowKit: the
  homepage must not pull the wallet stack into its bundle. The only wallet-adjacent
  affordance here is a link to /app, where connection actually happens.

  Floating glass pill (concept borrowed from stax.best's nav, reskinned in GuardRail's
  own palette), always `position: fixed`, never `sticky`. `sticky` still reserves its own
  box in normal flow, which pushed HeroSection's video down by the nav's height and left
  a strip of the ambient dot-grid background showing above it instead of video. `fixed`
  takes no layout space at all, so the hero starts at the true viewport top and the video
  covers it edge to edge; the nav floats on top via z-index instead of pushing content
  down.

  Left as a direct sibling in the marketing layout (see (marketing)/layout.tsx), not
  nested inside anything with `overflow-hidden` — an overflow-hidden ancestor clips
  `position: fixed` descendants too once that ancestor scrolls past the viewport, even
  though `fixed` is nominally viewport-relative.
*/
export function NavigationBar() {
  const [open, setOpen] = useState<boolean>(false);
  const [navVisible, setNavVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const ticking = useRef<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function updateVisibility(): void {
      const y = window.scrollY;
      if (y < 80) {
        setNavVisible(true);
      } else if (y > lastScrollY.current) {
        setNavVisible(false); // scrolling down
      } else {
        setNavVisible(true); // scrolling up
      }
      lastScrollY.current = y;
      ticking.current = false;
    }

    function onScroll(): void {
      if (ticking.current) return;
      ticking.current = true;
      // rAF-throttled so this runs at most once per paint, not once per scroll event.
      requestAnimationFrame(updateVisibility);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Return focus to the control that opened the drawer, not to the document body.
      toggleRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    // Prevent the page behind the drawer from scrolling under it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Move focus into the drawer so keyboard and screen reader users land inside it.
    panelRef.current?.focus();
  }, [open]);

  return (
    <div
      className="fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-7xl flex-col gap-2 sm:w-[calc(100%-4rem)]"
      style={{
        // translateX centres the fixed element; translateY drives the hide/show slide.
        // Both live in one `transform` so neither a Tailwind translate-x utility nor a
        // second inline property fights this one for the same CSS property.
        transform: `translateX(-50%) translateY(${navVisible ? 0 : -32}px)`,
        opacity: navVisible ? 1 : 0,
        pointerEvents: navVisible ? 'auto' : 'none',
        // Slower and gentler than a button micro-interaction on purpose: this is a large,
        // ever-present element repositioning itself, not a momentary control reacting to
        // a click, so a slow decelerating curve reads as deliberate rather than snappy.
        transition: prefersReduced
          ? 'none'
          : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className={cn(
          'flex h-14 w-full items-center justify-between rounded-full border border-border-bright',
          'bg-bg-panel/95 px-4 shadow-nav backdrop-blur-md backdrop-saturate-150 lg:px-6',
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full"
          aria-label="GuardRail home"
        >
          <AppLogo variant="full" size="md" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {MARKETING_NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="link-underline rounded font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-green"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="rounded-full" />

          <Link
            href="/app"
            className="edge-glow rounded-full border border-green/50 bg-green/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-green transition-colors hover:bg-green/20 lg:px-4 lg:py-2"
          >
            Launch app
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-full border border-border p-1.5 text-text-secondary transition-colors hover:border-border-bright hover:text-text-primary lg:hidden"
          >
            {open ? (
              <MdClose size={16} aria-hidden="true" />
            ) : (
              <MdMenu size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/*
        Its own floating pill below the main bar, not a panel hinged to it — keeping the
        rounded-full bar's shape intact rather than flattening its bottom edge open.
      */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: prefersReduced ? 0 : DURATION.base, ease: EASE_OUT }}
            className="overflow-hidden rounded-2xl border border-border/80 bg-bg-panel/95 shadow-nav backdrop-blur-md backdrop-saturate-150 lg:hidden"
          >
            <nav aria-label="Mobile" className="p-2">
              <ul className="flex flex-col gap-1">
                {MARKETING_NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2.5 font-mono text-sm uppercase tracking-wider text-text-secondary transition-colors hover:bg-bg-elevated hover:text-green"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
