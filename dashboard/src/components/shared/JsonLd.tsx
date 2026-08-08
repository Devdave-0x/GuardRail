import { SITE } from '@/lib/seo';
import { GITHUB_URL, MCP_TOOLS } from '@/lib/marketing-stats';

// === Types

/*
  Schema.org payloads are open-ended by design and vary per @type, so this is typed as
  an unknown-valued record rather than modelling every vocabulary. Values are ours, not
  user input, so there is nothing to narrow.
*/
type JsonLdGraph = Record<string, unknown>;

export interface JsonLdProps {
  data: JsonLdGraph | JsonLdGraph[];
}

// === Builders

/*
  Structured data is what earns a rich result rather than a plain blue link. Metadata
  tags alone do not produce one.
*/
export function softwareApplicationSchema(): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: MCP_TOOLS.map((tool) => tool.description),
    codeRepository: GITHUB_URL,
    author: {
      '@type': 'Organization',
      name: SITE.author,
      url: SITE.url,
    },
  };
}

export function organizationSchema(): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon`,
    sameAs: [GITHUB_URL],
  };
}

export function faqSchema(entries: readonly { question: string; answer: string }[]): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

// === Component

/*
  Renders one or more schema.org graphs. Safe against injection because every value
  originates in our own config, but JSON.stringify still escapes the payload.
*/
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
