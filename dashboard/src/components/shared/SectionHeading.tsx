import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// === Types

export interface SectionHeadingProps {
  /* Must match the owning Section's `id` so aria-labelledby resolves to this element. */
  id: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /* h1 for the hero, h2 everywhere else. Never skip a level for styling. */
  as?: 'h1' | 'h2';
  className?: string;
}

// === Component

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-widest text-green">{eyebrow}</p>
      )}
      <Heading
        id={`${id}-heading`}
        className="text-balance text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
      >
        {title}
      </Heading>
      {description && (
        <p className="text-pretty font-mono text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
