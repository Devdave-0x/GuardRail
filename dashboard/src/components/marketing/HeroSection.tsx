import { Section } from '@/components/shared/Section';
import { HeroCopy } from './HeroCopy';

// === Component

/*
  Hero. Full-bleed video fills the section as `decoration` (behind the content, see
  Section), copy sits centred on top of it.

  The video has no audio track (stripped at encode time) and no controls, so `muted`
  isn't fighting a real audio use case — it's required for autoplay in every browser.
  `poster` is the video's own first frame, so there's no flash of a different image
  before playback starts.

  No `use client` here. The video needs no JS to start, so the hero still renders and
  starts playing without a client boundary. HeroCopy is the one part of it that's
  stateful (the staggered entrance) and draws its own client boundary, same pattern as
  SpecularButton/ShinyText elsewhere.
*/
export function HeroSection() {
  return (
    <Section
      id="hero"
      spacing="loose"
      fullHeight
      background="bg-surface"
      innerClassName="flex items-center justify-center text-center"
      decoration={
        /*
          `isolate` is load-bearing, not decoration: Section is `relative` but never
          establishes its own stacking context (no z-index/opacity/transform of its own),
          so a bare `-z-10` child here escapes past Section's own background and lands
          behind the page's other stacking contexts instead — specifically under
          AmbientBackground's fixed layers, which tint the video by whatever the page
          background happens to be. That tint is invisible in dark mode (video and page
          background are both near-black) and shows up as exactly the light-mode
          contrast/shadow mismatch reported: the video was never rendering identically
          across themes, it was rendering behind a theme-dependent layer in one of them.
        */
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <video
            className="h-full w-full object-cover"
            src="/hero/hero-video.mp4"
            poster="/hero/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/hero/hero-video.webm" type="video/webm" />
            <source src="/hero/hero-video.mp4" type="video/mp4" />
          </video>
          {/*
            Flat scrim, not a gradient — text needs to read against whatever the frame is
            doing underneath, and a single opacity value is easier to keep in sync with the
            fixed white copy below than a fade that only protects part of the section.

            Fixed black at a fixed opacity, not `bg-bg` and not theme-conditional — the
            hero is meant to look identical in light and dark mode. The video and its
            scrim are the one surface in the app that deliberately doesn't reskin with the
            rest of the page.
          */}
          <div className="absolute inset-0 bg-black/70" />
        </div>
      }
    >
      <HeroCopy />
    </Section>
  );
}
