import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BASE_KEYWORDS, SITE } from '@/lib/seo';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

// Matches the font stack referenced from stax.best: Hanken Grotesk (UI), Fraunces
// (display serif), JetBrains Mono (data/mono). Space Grotesk is gone — it doesn't match.
const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/*
  Root metadata. Every field here is inherited by both route groups; pages override with
  createMetadata. The title template lives here so a page only ever declares its own
  title, and renaming the product is a one-line change.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}: on-chain policy for autonomous agents`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...BASE_KEYWORDS],
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  publisher: SITE.author,
  formatDetection: { telephone: false, address: false, email: false },
};

/* Viewport is a separate export in Next 14. themeColor in `metadata` is ignored. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};

/*
  Root layout holds only the document shell. Chrome and providers live in the route
  group layouts so the marketing bundle never pulls in wagmi and RainbowKit, and the
  app bundle never pulls in GSAP. See the bundle discipline note in docs/Context.md.
*/
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${hankenGrotesk.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg font-sans text-text-primary antialiased">
        <ThemeProvider>
          <a href="#main" className="skip-link sr-only">
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
