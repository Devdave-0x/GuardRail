import type { Metadata } from 'next';
import {
  DashboardPreviewSection,
  FinalCtaSection,
  GuardsSection,
  HeroSection,
  HowItWorksSection,
  LiveProofStrip,
  ProblemSection,
  QuickstartSection,
  ScenarioSection,
  StatsSection,
  ToolsSection,
  TrustSection,
} from '@/components/marketing';
import { JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/shared/JsonLd';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Give your AI agent a wallet. Keep the keys to the brakes.',
  path: '/',
  keywords: ['agent wallet demo', 'eth agent kit', 'create-eth-agent', 'agent guardrails'],
});

/*
  LiveProofStrip reads the chain on the server. Revalidating every 30s keeps the figures
  fresh without putting an RPC call in the path of every request.
*/
export const revalidate = 30;

export default function HomePage() {
  return (
    <>
      <JsonLd data={[softwareApplicationSchema(), organizationSchema()]} />

      <HeroSection />
      <LiveProofStrip />
      <ProblemSection />
      <HowItWorksSection />
      <GuardsSection />
      <ScenarioSection />
      <StatsSection />
      <DashboardPreviewSection />
      <QuickstartSection />
      <ToolsSection />
      <TrustSection />
      <FinalCtaSection />
    </>
  );
}
