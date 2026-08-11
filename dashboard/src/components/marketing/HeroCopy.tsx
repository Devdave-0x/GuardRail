'use client';

import Link from 'next/link';
import { MdOutlineOpenInNew } from 'react-icons/md';
import { motion } from 'motion/react';
import { ShinyText } from '@/components/reactbits/ShinyText';
import { SpecularButton } from '@/components/reactbits/SpecularButton';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { staggerParent, fadeUp, transitionBase, withReducedMotion } from '@/lib/motion-presets';
import { DEPLOYMENTS } from '@/lib/marketing-stats';

const BOT_CHAIN_DEPLOYMENT = DEPLOYMENTS[1];

/*
  The hero's own client boundary. HeroSection stays server-rendered for the LCP video;
  this is the one piece of it that's stateful: the eyebrow/heading/copy/CTA arrive as a
  staggered rise instead of popping in with the rest of the document, so the hero doesn't
  read as inert next to a full-bleed video that's already moving.

  fadeUp/staggerParent are the same vocabulary every other stateful surface uses (see
  motion-presets.ts), so this doesn't invent a one-off easing just for the hero.
*/
export function HeroCopy() {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerParent}
      className="flex w-full max-w-3xl flex-col items-center gap-6"
    >
      <motion.p
        variants={fadeUp}
        transition={withReducedMotion(transitionBase, prefersReduced)}
        className="font-mono text-caption uppercase tracking-widest text-green"
      >
        <ShinyText text="On-chain agent policy" speed={4} />
      </motion.p>

      <motion.h1
        id="hero-heading"
        variants={fadeUp}
        transition={withReducedMotion(transitionBase, prefersReduced)}
        className="text-balance font-serif text-display font-semibold text-fixed-light"
        style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)' }}
      >
        Give your <span className="text-green">AI agent</span> a <em className="italic">wallet</em>.
        Keep the keys to the brakes.
      </motion.h1>

      <motion.p
        variants={fadeUp}
        transition={withReducedMotion(transitionBase, prefersReduced)}
        className="max-w-xl text-pretty font-mono text-lead text-fixed-light/80"
        style={{ textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)' }}
      >
        GuardRail puts spending limits, whitelists, token policies, and a guardian kill switch
        inside the contract. The agent cannot argue its way past any of them.
      </motion.p>

      <motion.div
        variants={fadeUp}
        transition={withReducedMotion(transitionBase, prefersReduced)}
        className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
      >
        <Link href="/app" className="inline-flex w-full max-w-sm sm:w-auto">
          <SpecularButton lineColor="#00ff88" baseColor="#0f0f0f" textColor="#00ff88" radius={6}>
            Launch the dashboard
          </SpecularButton>
        </Link>

        {/*
          Second CTA, not a demo video we don't have, points at something real: the
          verified contract backing every guard the copy above describes.
        */}
        <a
          href={BOT_CHAIN_DEPLOYMENT.explorer}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-fixed-light/20 px-5 py-3 font-mono text-sm text-fixed-light/80 transition-colors hover:border-fixed-light/40 hover:text-fixed-light"
        >
          View the verified contract
          <MdOutlineOpenInNew size={15} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </motion.div>
    </motion.div>
  );
}
