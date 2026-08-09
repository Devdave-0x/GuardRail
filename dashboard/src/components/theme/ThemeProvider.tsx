'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/*
  Dark by default and no `enableSystem`: OS preference is intentionally ignored, so the
  toggle in ThemeToggle is the only thing that ever changes theme. `attribute="class"`
  makes next-themes add/remove `dark` or `light` on <html>, which both Tailwind's
  darkMode: "class" and the `.light` override block in globals.css key off.
*/
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
    >
      {children}
    </NextThemesProvider>
  );
}
