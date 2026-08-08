'use client';

import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

// === Types

export interface ScrollProgressProps {
  className?: string;
}

// === Component

/*
  Reading-position rail for a page header. Absolutely positioned onto the header's bottom
  edge, so it replaces the border rather than adding a row.

  The host header must be `relative` and must drop its own `border-b`, or the rail paints
  under a static line and reads as a rendering artefact.

  Progress is a document-level value, so this owns the listener itself. Mount one per
  header, not one per section.
*/
export function ScrollProgress({ className }: ScrollProgressProps) {
  useScrollProgress();

  /*
    Decorative: the rail duplicates the scrollbar, which assistive tech already reports.
    Announcing a percentage that changes on every wheel tick would be noise.
  */
  return <div aria-hidden="true" className={cn('scroll-progress', className)} />;
}
