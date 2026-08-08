import type { Metadata } from 'next';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/components/shared/Providers';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { AmbientBackground } from '@/components/shared/AmbientBackground';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Dashboard',
  description:
    'Monitor and control your AgentWallet: balances, spending limits, whitelist, token policies, and guardian actions.',
  path: '/app',
  // Behind a wallet connection and nothing to rank for, so keep it out of the index.
  noIndex: true,
});

/*
  App group. Owns the wallet stack, so RainbowKit styles and Providers mount here rather
  than in the root layout. Nothing in this group may import from (marketing).
*/
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {/*
        Same ambient stack as the marketing route at lower intensity, so the dashboard
        reads as the same product. Also feeds the cursor glow on every Panel.
      */}
      <AmbientBackground variant="subtle" />
      <Navbar />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <Footer variant="app" />
    </Providers>
  );
}
