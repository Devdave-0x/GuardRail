'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { MdOutlineBedtime, MdOutlineWbSunny } from 'react-icons/md';
import { cn } from '@/lib/utils';

type Mode = 'dark' | 'light';

/*
  Flips the `dark`/`light` class on <html> directly rather than waiting on next-themes'
  own effect, then tells next-themes about it via setTheme so its internal state doesn't
  drift out of sync. The direct class flip is what startViewTransition below actually
  snapshots; if this only called setTheme, the DOM mutation would land on the next tick,
  after the transition's before/after snapshots were already taken.
*/
function applyTheme(next: Mode, setTheme: (value: string) => void): void {
  const root = document.documentElement;
  const current: Mode = next === 'dark' ? 'light' : 'dark';
  root.classList.remove(current);
  root.classList.add(next);
  setTheme(next);
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  /*
    resolvedTheme is undefined on first client render, before next-themes reads the
    stored preference. Rendering a neutral icon until then avoids a light/dark flash.
  */
  useEffect(() => setMounted(true), []);

  function handleClick(): void {
    const current: Mode = resolvedTheme === 'light' ? 'light' : 'dark';
    const next: Mode = current === 'dark' ? 'light' : 'dark';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      applyTheme(next, setTheme);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      document.documentElement.style.setProperty('--theme-toggle-x', `${x}px`);
      document.documentElement.style.setProperty('--theme-toggle-y', `${y}px`);
    }

    document.startViewTransition(() => applyTheme(next, setTheme));
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        disabled
        className={cn('rounded border border-border p-1.5 text-text-secondary', className)}
      >
        <MdOutlineBedtime size={16} aria-hidden="true" />
      </button>
    );
  }

  const isDark = resolvedTheme !== 'light';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'rounded border border-border p-1.5 text-text-secondary transition-colors hover:border-border-bright hover:text-text-primary',
        className,
      )}
    >
      {isDark ? (
        <MdOutlineWbSunny size={16} aria-hidden="true" />
      ) : (
        <MdOutlineBedtime size={16} aria-hidden="true" />
      )}
    </button>
  );
}
