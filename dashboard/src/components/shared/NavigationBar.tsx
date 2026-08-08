'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AppLogo } from '@/components/shared/AppLogo';
import { MARKETING_NAV } from '@/lib/marketing-stats';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { DURATION, EASE_OUT } from '@/lib/motion-presets';
import { cn } from '@/lib/utils';

// === Component

/*
  Marketing-route navigation. Deliberately does not import wagmi or RainbowKit: the
  homepage must not pull the wallet stack into its bundle. The only wallet-adjacent
  affordance here is a link to /app, where connection actually happens.
*/
export function NavigationBar() {
  const [open, setOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
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
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-300',
        scrolled ? 'border-border bg-bg/90 backdrop-blur' : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-container items-center justify-between px-section-px lg:h-16">
        <Link href="/" className="flex items-center gap-1.5 rounded" aria-label="GuardRail home">
          <AppLogo variant="full" size="md" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {MARKETING_NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-green"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="edge-glow rounded border border-green/50 bg-green/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-green transition-colors hover:bg-green/20 lg:px-4 lg:py-2"
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
            className="rounded border border-border p-1.5 text-text-secondary transition-colors hover:border-border-bright hover:text-text-primary lg:hidden"
          >
            {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: prefersReduced ? 0 : DURATION.base, ease: EASE_OUT }}
            className="overflow-hidden border-t border-border bg-bg lg:hidden"
          >
            <nav aria-label="Mobile" className="px-section-px py-4">
              <ul className="flex flex-col gap-1">
                {MARKETING_NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded px-2 py-2.5 font-mono text-sm uppercase tracking-wider text-text-secondary transition-colors hover:bg-bg-elevated hover:text-green"
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
    </header>
  );
}
