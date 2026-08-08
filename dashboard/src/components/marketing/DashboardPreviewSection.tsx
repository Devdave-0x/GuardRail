'use client';

import Link from 'next/link';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useSectionReveal } from '@/hooks';
import { LiveProductHero } from './LiveProductHero';

// === Component

/*
  Shows the product running rather than a static screenshot. LiveProductHero replays a
  scripted transfer through the policy, so this section needs no image asset and cannot
  go stale against the real UI.
*/
export function DashboardPreviewSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="preview" background="bg-bg" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="preview"
            eyebrow="The dashboard"
            title="Watch the policy do its job"
            description="Every agent action is checked, logged, and reversible by a guardian before it settles."
          />
        </div>

        <div data-reveal className="flex flex-col gap-6">
          <LiveProductHero />

          <Link
            href="/app"
            className="edge-glow inline-flex w-fit items-center justify-center rounded border border-green/50 bg-green/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-green transition-colors hover:bg-green/20"
          >
            Open the dashboard
          </Link>
        </div>
      </div>
    </Section>
  );
}
