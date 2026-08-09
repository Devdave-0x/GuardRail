import { cn } from '@/lib/utils';

// === Types

export interface AppLogoProps {
  /* `mark` is the glyph alone. `full` adds the wordmark beside it. */
  variant?: 'mark' | 'full';
  /* Rendered height of the glyph. The wordmark scales alongside it. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// === Mark

/*
  The glyph is inline SVG rather than the PNG in docs/Screens.

  It stays crisp at any size, inherits currentColor so a single component serves the green
  nav lockup and a muted footer one, adds no image request, and cannot cause layout shift.
  The source PNG is 32 kB and none of that is true of it.

  Geometry: two brackets enclosing two horizontal rails, split by a dashed centre line.
  Brackets are the policy boundary, rails are the guard, the dashed line is the agent
  passing through.
*/
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Left bracket */}
      <path d="M13 4 H5 V36 H13" />
      {/* Right bracket */}
      <path d="M35 4 H43 V36 H35" />
      {/* Rails */}
      <path d="M12 16 H36" />
      <path d="M12 24 H36" />
      {/* Dashed centre line */}
      <path d="M24 5 V35" strokeDasharray="4 4" strokeWidth={3} />
    </svg>
  );
}

// === Component

const MARK_SIZE: Record<NonNullable<AppLogoProps['size']>, string> = {
  sm: 'h-4',
  md: 'h-5',
  lg: 'h-7',
};

const WORD_SIZE: Record<NonNullable<AppLogoProps['size']>, string> = {
  sm: 'text-micro',
  md: 'text-caption',
  lg: 'text-body',
};

/*
  The whole lockup is one aria-hidden visual with the name in a sibling span, so a screen
  reader hears "GuardRail" once rather than reading the SVG and the wordmark separately.
  Consumers that need a different accessible name should label their own link instead.
*/
export function AppLogo({ variant = 'full', size = 'md', className }: AppLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-green', className)}>
      <Mark className={cn(MARK_SIZE[size], 'w-auto shrink-0')} />
      {variant === 'full' && (
        <span
          aria-hidden="true"
          className={cn(
            'font-mono font-bold uppercase leading-none tracking-logo text-text-primary',
            WORD_SIZE[size],
          )}
        >
          GuardRail
        </span>
      )}
      <span className="sr-only">GuardRail</span>
    </span>
  );
}
