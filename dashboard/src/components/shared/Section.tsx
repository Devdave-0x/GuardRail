import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// === Types

export interface SectionProps {
  children: ReactNode;
  /* Anchor target, also used to derive the heading id for aria-labelledby. */
  id?: string;
  /*
    Background utilities for the section element itself. Per docs/Context.md the section
    is the only place a background belongs, because `relative` on it anchors any
    absolutely positioned decoration.
  */
  background?: string;
  /* Vertical rhythm, on the inner container so backgrounds still bleed full width. */
  spacing?: 'none' | 'tight' | 'base' | 'loose';
  /* Absolutely positioned decoration rendered behind the content, inside the section. */
  decoration?: ReactNode;
  /* id of the heading that labels this section. Falls back to `${id}-heading`. */
  labelledBy?: string;
  /* Use when the section has no visible heading to point at. */
  label?: string;
  /* Fill the viewport. Uses svh so mobile browser chrome does not cause a jump. */
  fullHeight?: boolean;
  className?: string;
  innerClassName?: string;
  as?: ElementType;
}

/*
  Rhythm scales, not breakpoints. Each token is already responsive because it resolves
  to a CSS variable that shifts at sm and lg, so there is no ladder to repeat here.
*/
const SPACING: Record<NonNullable<SectionProps['spacing']>, string> = {
  none: '',
  tight: 'py-section-py-tight',
  base: 'py-section-py',
  loose: 'py-section-py-loose',
};

// === Component

/*
  The single implementation of the section layout convention. Every top-level section on
  every page goes through this, so the rule cannot drift as sections are added:

    <section relative w-full h-full [background]>
      <div mx-auto w-full max-w-container px-section-px>

  Note on h-full: height 100% resolves against the parent, so in normal flow it computes
  to auto and the section is sized by its content. That is intended. `fullHeight` adds an
  explicit min-h-svh for the cases that genuinely need to fill the viewport.
*/
export function Section({
  children,
  id,
  background,
  spacing = 'base',
  decoration,
  labelledBy,
  label,
  fullHeight = false,
  className,
  innerClassName,
  as: Component = 'section',
}: SectionProps) {
  const headingId = labelledBy ?? (id ? `${id}-heading` : undefined);

  return (
    <Component
      id={id}
      aria-labelledby={label ? undefined : headingId}
      aria-label={label}
      className={cn(
        /*
          `isolate` contains any -z-10 decoration inside this Section's own stacking
          context. Without it, `relative` alone doesn't establish one, so a negative
          z-index child (e.g. HeroSection's video) escapes past this element's own
          background and lands behind whatever the page's other stacking contexts are,
          in this app, AmbientBackground's fixed layers, which tint it by the page
          background and make it look different across themes even when its own classes
          are theme-independent.
        */
        'relative isolate h-full w-full',
        fullHeight && 'min-h-svh',
        background,
        className,
      )}
    >
      {decoration}
      <div
        className={cn(
          'relative mx-auto w-full max-w-container px-section-px',
          SPACING[spacing],
          innerClassName,
        )}
      >
        {children}
      </div>
    </Component>
  );
}
