'use client';

import { NavigationBar } from '@/components/shared/NavigationBar';
import { Footer } from '@/components/shared/Footer';
import { AmbientBackground } from '@/components/shared/AmbientBackground';

/*
  Marketing group. Deliberately free of wagmi and RainbowKit so the homepage does not
  ship the wallet stack.

  AmbientBackground owns every background layer and both delegated listeners (pointer and
  scroll), so nothing else here needs to mount PointerGlow.
*/
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmbientBackground variant="full" />
      <NavigationBar />
      <main id="main">{children}</main>
      <Footer variant="marketing" />
    </>
  );
}
