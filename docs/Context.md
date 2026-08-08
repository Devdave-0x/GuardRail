# GuardRail Frontend Context

Conventions for the GuardRail dashboard and marketing site. Read this before writing any
component. It is the single source of truth for layout, animation, accessibility, and
responsive rules. If a rule here conflicts with something you find in the codebase, this
file wins and the codebase gets fixed.

## Routes

The app lives in `dashboard/` (Next.js 14, App Router, TypeScript, Tailwind).

| Route  | Route group   | What it is                                   |
| ------ | ------------- | -------------------------------------------- |
| `/`    | `(marketing)` | Public homepage that sells the product       |
| `/app` | `(app)`       | The AgentWallet dashboard, previously at `/` |

The two groups have different chrome, different animation engines, and different bundles.
Nothing in `(app)` may import from `(marketing)` or the reverse. Shared code goes in
`src/components/shared/`.

## Section layout convention

Every top-level section on any page follows this exact shape.

```tsx
<section className="relative h-full w-full bg-bg" aria-labelledby="hero-heading">
  <div className="mx-auto w-full max-w-container px-section-px py-section-py">{/* content */}</div>
</section>
```

In practice you never write that by hand. `src/components/shared/Section.tsx` is the only
implementation of this shape, and every top-level section goes through it so the rule
cannot drift as sections are added.

Rules:

- The `<section>` element itself carries `relative`, `w-full`, `h-full`.
- The `<section>` element is the only place a section background is set. Background
  colour, background image, and any absolutely positioned decoration belong here, never
  on the inner div. `relative` on the section is what anchors that decoration.
- The inner div carries the width constraint: `mx-auto`, `w-full`, `max-w-container`, and
  the horizontal padding.
- `max-w-container` is a Tailwind theme token, not a magic number. It is defined once in
  `tailwind.config.js` and used everywhere. Never write `max-w-[1600px]` inline.

## Spacing tokens

**Never write a responsive padding ladder like `px-4 sm:px-6 lg:px-8` at a call site.**

Spacing is responsive at the _token_ level, not the call site. Each token is a CSS
variable whose value changes at the breakpoints, so a single class is already responsive:

```tsx
<div className="px-section-px py-section-py">
```

The tokens:

| Token                 | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `px-section-px`       | Horizontal page gutter. The only gutter value on the site. |
| `py-section-py`       | Default section vertical rhythm.                           |
| `py-section-py-tight` | Denser sections, and the app route's page padding.         |
| `py-section-py-loose` | Hero and closing sections.                                 |
| `gap-panel-gap`       | Gap between dashboard panels.                              |
| `gap-stack-gap`       | Gap inside a small stacked group.                          |

`-tight` and `-loose` are **rhythm scales, not breakpoints**. Each is independently
responsive.

Definitions live in `globals.css` under `@layer base`, and every value comes from
`theme()` with breakpoints from `@screen`:

```css
@layer base {
  :root {
    --section-px: theme('spacing.4');
  }
  @screen sm {
    :root {
      --section-px: theme('spacing.6');
    }
  }
}
```

This matters: `tailwind.config.js` stays the single source of truth for both the spacing
scale and the breakpoints. No `640px` and no `1.5rem` literal is ever duplicated into
CSS, so the tokens cannot drift from the config.

Component-internal padding is out of scope. A table cell's `px-4 py-2` or a button's
`px-3 py-1.5` is part of that component's own scale, not the page gutter, and stays a
plain utility.

## Spacing between elements

**Prefer flex or grid with `gap` over `space-y-*`, `space-x-*`, or margin.**

- `space-y-*` works by setting a margin on every child but the first. It leaks into
  children, breaks when a child is conditionally rendered or reordered, and fights any
  child that sets its own margin.
- `gap` is owned by the container, applies only between items, and is unaffected by
  which children happen to render.

So:

```tsx
<div className="flex flex-col gap-3">   // yes
<div className="space-y-3">             // no
<div className="mt-10">                 // no, put the gap on the parent
```

Reach for margin only to push a single element against its container in a way no parent
gap can express. If you find yourself adding `mt-*` to create rhythm in a list, the
parent needs `gap` instead.

Note on `h-full`: `height: 100%` resolves against the parent's height, so on a normally
flowing page it computes to `auto` and the section is sized by its content. That is the
intended behaviour. When a section genuinely needs to fill the viewport, add an explicit
`min-h-svh` alongside `h-full`. Use `svh`, not `vh`, so mobile browser chrome does not
cause the jump.

## Responsive

**Only two breakpoints: `sm:` and `lg:`. Never `md:`.**

Mobile first. Write the mobile styles unprefixed, then layer `sm:` and `lg:`. If a layout
seems to need `md:`, the layout is wrong. Pick whichever of `sm:` or `lg:` is the better
transition point and adjust the design.

- unprefixed: mobile, 0px and up
- `sm:` 640px and up, large phone and tablet
- `lg:` 1024px and up, desktop

Any existing `md:` in the codebase is legacy and gets converted on sight.

Grids follow the same discipline. `grid-cols-1 lg:grid-cols-3`, not
`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, unless the middle step genuinely earns itself
at `sm:`.

## Animation engines

Three engines, strictly divided. **Never animate the same property with two of them.**

| Engine                   | Owns                                                  | Where                          |
| ------------------------ | ----------------------------------------------------- | ------------------------------ |
| GSAP + ScrollTrigger     | Scroll-position-driven and timeline-sequenced motion  | `(marketing)` only             |
| Motion (`motion/react`)  | State-driven and lifecycle motion, enter/exit, layout | `(app)` mostly, some marketing |
| CSS / Tailwind keyframes | Everything cheap and always-on                        | Both                           |

Deciding which: **is it triggered by scrolling, or by a React state change?** Scrolling is
GSAP. State is Motion. Always-on ambient loops like the existing `pulse-green`, `scan`,
`blink`, and `crt-flicker` stay in CSS and must not be ported to JS.

The package is `motion`, imported as `motion/react`. It is not `framer-motion`, though
they are the same library. Do not add `framer-motion` to `package.json`.

GSAP work in React must use the `useGSAP` hook from `@gsap/react`, never a bare
`useEffect`. `useGSAP` handles cleanup and React 18 StrictMode's double-invoked effects.
Without it, ScrollTriggers orphan themselves in development.

GSAP 3.13 and later ship SplitText, ScrollTrigger, ScrollSmoother, and MorphSVG in the
free public npm package under the standard no-charge licence. No Club membership and no
private registry are required.

### Bundle discipline

Route groups code-split. `(app)` must never pull in GSAP. `(marketing)` must never pull in
the wagmi and RainbowKit stack. If you find yourself importing across that line, the
component belongs in `shared/` and needs splitting.

## WebGL budget

Several vendored React Bits components allocate their own WebGL context. Browsers cap live
contexts per page at roughly 8 to 16 on desktop and fewer on mobile. Past the cap the
browser silently kills the oldest context, and since these components have no
`webglcontextlost` handler, that canvas never comes back. The symptom is a blank rectangle
after scrolling away and back, and it will not reproduce on a fast dev machine.

Contexts are a countable budget. Spend them deliberately.

| Component                                       | Contexts        | Engine     |
| ----------------------------------------------- | --------------- | ---------- |
| `DotField`                                      | 0               | Canvas 2D  |
| `BorderGlow`, `SpotlightCard`                   | 0               | CSS        |
| `SpecularButton`                                | 1 per instance  | ogl        |
| `Prism`, `LightRays`, `Aurora`, `GradientWaves` | 1               | ogl        |
| `LaserFlow`                                     | 1, large bundle | three      |
| `ElectricBorder`                                | 0               | SVG filter |

Allocation:

- **Marketing route: 3 contexts.** `DotField` background (0), one hero effect (1), two
  `SpecularButton` CTAs (2). Additional WebGL section backgrounds must lazy-mount on
  scroll into view and unmount on exit so they borrow a slot rather than adding one.
- **App route: 1 context maximum.** `DotField` (0), `BorderGlow` on all panels (0), and
  optionally `Connect Wallet` as the single `SpecularButton` (1).
- **Never more than 2 WebGL surfaces animating in the viewport at once.**

Every button that is not one of those few gets the CSS edge-glow treatment instead. It is
a radial gradient positioned from two CSS custom properties, driven by a single delegated
`pointermove` listener on the document. One listener for the whole page, not one per
button. At the size GuardRail's buttons render, the difference is not perceptible.

Every rAF-driven component must gate its loop on an IntersectionObserver and on
`document.visibilitychange`. Offscreen and background-tab animation is not acceptable.

## Accessibility

Treated as a correctness requirement, not a polish pass.

- **No missing `alt`.** Every `<img>` has one. Decorative images get `alt=""` **and**
  `aria-hidden="true"` together. An absent `alt` attribute is a bug.
- **Decorative canvases** get `aria-hidden="true"` and must not be focusable.
- **Real elements.** Anything clickable is a `<button type="button">` or an `<a>`. No
  `onClick` on a bare `div`. If a div is unavoidable, it needs `role`, `tabIndex`, and an
  `onKeyDown` handling both Enter and Space.
- **Animated text must be readable.** `SplitText`, `DecryptedText`, `TextType`, `CountUp`,
  and `ShinyText` shred text into per-character spans, which screen readers announce
  letter by letter. Wrap the animated visual in `aria-hidden="true"` and put the plain
  string in an adjacent visually-hidden element.
- **`prefers-reduced-motion: reduce` is honoured everywhere.** When set, skip the
  animation and render the final resting state immediately. Never start a rAF loop.
- **Focus is visible.** `globals.css` already sets a green `:focus-visible` outline. Do not
  remove it, and do not set `outline: none` without a replacement.
- **Headings are ordered.** One `<h1>` per page. Sections use `<h2>`. Never skip a level
  for styling; use classes for size.
- **Sections are labelled.** Each `<section>` gets `aria-labelledby` pointing at its
  heading's `id`, or `aria-label` if it has no visible heading.
- **Live regions.** Values that update without user action, such as vault balance, daily
  spend, and timelock countdowns, need `aria-live="polite"`. Errors need
  `aria-live="assertive"`.
- **Colour is never the only signal.** The palette leans hard on green for "ok" and red
  for "error". Every status also carries an icon or text label.
- **Contrast.** `text-muted` at `#555555` on `#0a0a0a` is roughly 3.2:1, which fails WCAG
  AA for body text. It is acceptable only for large or non-essential text. Anything a user
  must read uses `text-secondary` or brighter.

## TypeScript

- **No `any`.** Use `unknown` and narrow with a type guard, or add a generic constraint.
  The three permitted exceptions each require an inline `//` comment explaining why.
- **Annotate all state explicitly**, even when inference would work. `useState<boolean>(false)`,
  `useRef<HTMLDivElement | null>(null)`. This is deliberate verbosity for scannability.
- **Explicit return types** on custom hooks and on any non-trivial function.
- `interface` for object shapes and contracts. `type` for unions, intersections, mapped and
  conditional types.
- Component props go in an exported interface named `<ComponentName>Props`.
- Shared types live in `src/types/index.ts` and are never redeclared in a consumer.

## Comments

- Section dividers are exactly `// === Section Name`. Never `// --- x ---`, never box
  drawing characters, never a row of equals signs.
- Regular `//` inside functions.
- Multi-line outside JSX uses plain `/* */`.
- `{/* */}` **only** inside returned JSX markup. It is invalid anywhere else.
- Comment the non-obvious why, not the what.

## Prose and markdown

No em dash characters anywhere: code comments, markdown, commit messages, PR descriptions.
Do not substitute a hyphen either. Rewrite the sentence so neither is needed. Hyphens are
for compound words, prefixes, and ranges only.

## Component vendoring

React Bits components are copied into `src/components/reactbits/`, not installed as a
dependency. Sources come from the `ts-tailwind` variant of the upstream repo. Once copied
they are our code and our maintenance burden, which is why the set is deliberately small.

Every vendored component is adapted before use: `'use client'` directive, strict types,
project palette as the default prop values, accessibility rules above, reduced-motion
support, and IntersectionObserver gating on any rAF loop.

### Never import React Bits from the barrel

`src/components/reactbits/index.ts` exists for discoverability and type re-exports only.
**Application code must deep-import the specific file:**

```tsx
import { DotField } from '@/components/reactbits/DotField'; // yes
import { DotField } from '@/components/reactbits'; // no
```

Several of these modules call `gsap.registerPlugin` at module scope, which is a side
effect, so the bundler cannot tree-shake the barrel. Importing `DotField` from it pulls
in `LaserFlow` (three), `Aurora` and `GradientWaves` (ogl), and `MagicBento` (gsap).

This is not theoretical. The marketing route's First Load JS was **456 kB** with barrel
imports and **303 kB** after switching six imports to deep paths, with `three` dropping
out of the initial payload entirely.

Anything three-based is additionally loaded through `next/dynamic` with `ssr: false`, so
it stays out of First Load even where it is used. `LaserFlow` in `HeroSection` is the
reference example.

## Shared logic

If a piece of logic, animation, or layout appears twice, it moves. No exceptions, and
this is checked on review. The extraction targets, in order of preference: a hook in
`src/hooks/`, a preset or constant in `src/lib/`, then a component in
`src/components/shared/`.

These already exist and must be used rather than reimplemented:

| Module                                             | Replaces                                                                                                                                                             |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usePrefersReducedMotion` / `prefersReducedMotion` | Every inline `matchMedia` call                                                                                                                                       |
| `useInViewport`                                    | Every hand-rolled IntersectionObserver                                                                                                                               |
| `useRafLoop`                                       | Every hand-rolled `requestAnimationFrame` loop. Handles tab visibility, delta clamping, and holds the callback in a ref so an inline arrow does not restart the loop |
| `usePointerGlow`                                   | Per-element `pointermove` listeners. One delegated listener per route group feeds every `.edge-glow`                                                                 |
| `useCopyToClipboard`                               | Inline clipboard plus timeout state                                                                                                                                  |
| `useCountdown`                                     | Inline countdown intervals                                                                                                                                           |
| `useSectionReveal`                                 | Per-section ScrollTrigger setup                                                                                                                                      |
| `lib/motion-presets.ts`                            | Inline Motion variants, easings, durations                                                                                                                           |
| `components/shared/Section.tsx`                    | Hand-written section wrappers                                                                                                                                        |
| `components/shared/SectionHeading.tsx`             | Hand-wired heading ids and `aria-labelledby`                                                                                                                         |

`EASE_OUT` in `motion-presets.ts` is the cubic-bezier equivalent of GSAP's `power3.out`,
so a Motion transition and a GSAP tween of the same duration feel identical. Use it
rather than inventing a curve.

A type is declared once, in `src/types/index.ts`, and imported everywhere else. It is a
bug for the same interface to exist in two files, and it has already happened once:
`ExecutedEvent` was declared in both `types/index.ts` and `hooks/useEvents.ts` and the two
copies had silently diverged.

## Hero centrepiece

The reference videos both carry their hero with a rendered 3D asset that we do not have.
`LaserFlow` substitutes for it and reads as a beam of light through a guard rail, which is
on-metaphor.

Be aware that `LaserFlow` imports `three`, not `ogl`, which is a materially larger bundle
than the rest of the vendored set. `Prism` and `LightRays` are `ogl`-based alternatives at
a fraction of the weight if the bundle cost proves unacceptable.

### Phase two: the live product hero

The stronger long-term hero is not an abstract effect. It is the product itself, running.
A scripted loop of the agent requesting a transfer, the policy checking it, the
transaction clearing, and the daily limit bar filling. It shows the product instead of
decorating around it, and it needs no 3D pipeline.

Sketch:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// === Types

interface ScriptStep {
  id: string;
  actor: 'agent' | 'policy' | 'chain';
  label: string;
  detail: string;
  // Fraction of the daily limit consumed after this step resolves, 0 to 1.
  dailySpent: number;
}

// === Script

// Mirrors a real transfer_eth call through AgentWallet. Values are illustrative,
// not read from chain, so the hero never depends on RPC availability.
const SCRIPT: ScriptStep[] = [
  {
    id: 'request',
    actor: 'agent',
    label: 'agent.request',
    detail: 'send 0.05 BOT to 0x829C...2e63',
    dailySpent: 0,
  },
  {
    id: 'limit',
    actor: 'policy',
    label: 'policy.checkTxLimit',
    detail: '0.05 <= 0.1 per-tx cap',
    dailySpent: 0,
  },
  {
    id: 'whitelist',
    actor: 'policy',
    label: 'policy.checkWhitelist',
    detail: 'target allowed, selector 0x00000000',
    dailySpent: 0,
  },
  {
    id: 'execute',
    actor: 'chain',
    label: 'chain.execute',
    detail: 'Executed(target, 0.05, 0x00000000)',
    dailySpent: 0.1,
  },
];

const STEP_MS = 1400;

// === Component

export function LiveProductHero(): JSX.Element {
  const [index, setIndex] = useState<number>(0);
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    // Reduced motion gets the resolved end state, not a paused first frame.
    if (reduced) {
      setIndex(SCRIPT.length - 1);
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SCRIPT.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  const step = SCRIPT[index];

  return (
    <div
      className="relative w-full rounded-lg border border-green/40 bg-bg-panel p-4"
      role="img"
      aria-label="Demonstration of GuardRail checking and executing an agent transaction within its policy limits"
    >
      <div aria-hidden="true" className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="font-mono text-xs"
          >
            <span className="text-green">{step.label}</span>
            <span className="ml-2 text-text-secondary">{step.detail}</span>
          </motion.div>
        </AnimatePresence>

        <div className="h-1.5 overflow-hidden rounded-full border border-border bg-bg-elevated">
          <motion.div
            className="h-full rounded-full bg-green"
            animate={{ width: `${step.dailySpent * 100}%` }}
            transition={{ duration: reduced ? 0 : 0.6 }}
          />
        </div>
      </div>
    </div>
  );
}
```

The `role="img"` plus a descriptive `aria-label`, with the animated internals
`aria-hidden`, is the right pattern here. The animation is a single conceptual image, and
narrating four rotating steps to a screen reader would be noise rather than information.

## Stats without backend changes

The backend and contracts are frozen. Homepage stats come from what is already exposed.

- **Live.** `GET /api/contract` returns `balanceFormatted`, `ethTxLimitFormatted`,
  `ethDailyLimitFormatted`, `ethDailySpentFormatted`, `dailySpentPercent`, `paused`, and
  `chainId`. It already caches for 10 seconds and degrades to a zeroed shape with
  `rpcUnavailable: true` when RPC fails, so a dead node yields zeros rather than a broken
  page. The homepage is a server component in the same app, so it reads these directly
  with `revalidate = 30`.
- **Derived constants.** 2 chains, 8 MCP tools, 6 guard types, 10 minute timelock, 2-step
  role transfers. These are facts from the contract and README, and they live in
  `src/lib/marketing-stats.ts`. Rendering a constant through `CountUp` is legitimate.
- **Not doing.** Lifetime transaction counts and total value routed would require indexing
  full contract history. `GET /api/events` deliberately avoids that with a 115k block
  lookback and a chunk cap to keep latency predictable. Do not extend it.
