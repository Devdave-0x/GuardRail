import type { Metadata } from 'next';
import type { SeoOptions } from '@/types';

/*
  Central SEO configuration and the createMetadata factory.

  This is the App Router equivalent of a useSeoMeta composable. It cannot be a hook:
  `metadata` is a server export that Next resolves while rendering the route, and hooks
  run client-side, after the <head> is already committed. A factory called from each
  page's `export const metadata` gives the same ergonomics in the shape the framework
  actually supports.
*/

// === Site

export const SITE = {
  name: 'GuardRail',
  /*
    metadataBase resolves every relative OG and canonical URL to an absolute one.
    Without it Next emits relative og:image URLs, which most crawlers silently drop.
  */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guardrail.dev',
  description:
    'Give your AI agent an on-chain wallet with spending limits, whitelisting, token policies, and a guardian kill switch, enforced by the contract rather than by prompts.',
  locale: 'en_US',
  author: 'GuardRail',
  twitter: '@guardrail',
} as const;

// === Keywords

/*
  Merged into every page. Page-specific keywords are appended, not substituted, so a
  page never loses the product-level terms by defining its own.
*/
export const BASE_KEYWORDS: readonly string[] = [
  'AI agent wallet',
  'autonomous agent',
  'on-chain policy',
  'agent spending limits',
  'smart contract wallet',
  'MCP server',
  'Model Context Protocol',
  'Ethereum',
  'EVM',
  'Sepolia',
  'BOT Chain',
  'Solidity',
  'AgentWallet',
  'guardian kill switch',
  'timelock',
  'whitelist',
  'ERC-20 token policy',
  'web3 security',
  'agent infrastructure',
  'crypto AI agent',
];

// === Factory

/*
  Builds a complete Metadata object from a small per-page input. Everything not passed
  falls back to the site defaults, so a page can be as terse as { title, description }.
*/
export function createMetadata({
  title,
  description = SITE.description,
  keywords = [],
  path = '/',
  image,
  imageAlt,
  type = 'website',
  noIndex = false,
  publishedTime,
}: SeoOptions): Metadata {
  const canonical = path;
  const resolvedImage = image ?? '/opengraph-image';
  const resolvedImageAlt = imageAlt ?? `${SITE.name}: ${SITE.description}`;

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...keywords],
    authors: [{ name: SITE.author }],
    creator: SITE.author,
    publisher: SITE.author,

    alternates: {
      canonical,
    },

    /*
      Dashboards have nothing to rank for, and indexing them splits authority away from
      the pages that do. Anything behind a wallet connection sets noIndex.
    */
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },

    openGraph: {
      type,
      siteName: SITE.name,
      locale: SITE.locale,
      url: canonical,
      title: typeof title === 'string' ? title : SITE.name,
      description,
      images: [{ url: resolvedImage, width: 1200, height: 630, alt: resolvedImageAlt }],
      ...(publishedTime ? { publishedTime } : {}),
    },

    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      creator: SITE.twitter,
      title: typeof title === 'string' ? title : SITE.name,
      description,
      images: [{ url: resolvedImage, alt: resolvedImageAlt }],
    },

    // Surfaced in some crawlers and in iOS/Android add-to-homescreen.
    applicationName: SITE.name,
    category: 'technology',
    formatDetection: { telephone: false, address: false, email: false },
  };
}
