# GuardRail Context

Working agreements and conventions for this repo, for humans and agents alike.

This is the single source of truth for repository practice, code style, layout, motion,
accessibility, and the frontend architecture. If a rule here conflicts with something you
find in the codebase, this file wins and the codebase gets fixed.

Sections 1 to 3 apply to the whole repository. Sections 4 onward are specific to
`dashboard/`, the Next.js 14 App Router frontend.

---

## 1. Working agreements

### Committing

**Do not create git commits unless the repo owner explicitly asks for one.**

Make the changes, report what changed, and stop. Staging is fine. Committing is not. Wait
for an explicit instruction such as "commit this" or "commit and push". This applies to
every branch, including `develop`.

### Secrets

`.env.example` holds placeholders only. Never copy a live value into it. Real values
belong in `.env`, which is gitignored.

### Generated and vendored code

Do not format, lint, or refactor these. They are shipped or vendored artifacts.

- `contracts/lib/**`, the Foundry dependencies.
- `packages/create-eth-agent/templates/**`, the scaffold handed to end users, including
  its own vendored `contracts/lib/openzeppelin-contracts`.

React Bits components under `dashboard/src/components/reactbits/` are a separate case.
They are vendored but they are also ours to maintain. See section 7.

### Build output

`.next/` is generated and safe to delete. Dev and production output cannot share it: a
`next build` followed by `next dev` against the same directory produces missing chunk
errors such as `Cannot find module './916.js'` and 404s on static assets. Run
`npm run clean -w dashboard` if the dev server starts misbehaving.

---

## 2. Workspaces and tooling

### Package manager

npm workspaces. There is no pnpm lockfile and no plan to add one.

Root `build` must build `eth-agent-kit` before `runtime`, because npm workspaces does not
order builds by dependency graph.

### Module systems

Each workspace member is deliberate about its module system. Do not "unify" them.

| Workspace                   | System          | Why                                                                                  |
| --------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `runtime`                   | ESM             | Talks to Node directly. The MCP SDK's exports-map subpaths only resolve this way     |
| `dashboard`                 | No `type` field | `next.config.js`, `postcss.config.js`, and `tailwind.config.js` use `module.exports` |
| `packages/eth-agent-kit`    | CommonJS        | Published to npm, consumed by scaffolded projects whose templates are CJS            |
| `packages/create-eth-agent` | CommonJS        | Same                                                                                 |

`runtime` reaches the kit via `await import()`, which works across the boundary. Adding
`"type": "module"` to `dashboard` breaks all three of its config files.

### Routes

| Route  | Route group   | What it is                                   |
| ------ | ------------- | -------------------------------------------- |
| `/`    | `(marketing)` | Public homepage that sells the product       |
| `/app` | `(app)`       | The AgentWallet dashboard, previously at `/` |

The two groups have different chrome, different animation engines, and different bundles.
Nothing in `(app)` may import from `(marketing)` or the reverse. Shared code goes in
`src/components/shared/`.

### Route-transition loading

`(app)/loading.tsx` is the Suspense fallback Next shows while the `/app` segment itself is
still arriving: first-visit chunk download, cold RSC render. It is a static skeleton that
mirrors `DashboardPage`'s 12-column grid exactly (same order, same `lg:col-span-*`), so
nothing reflows when real panels replace it. No shimmer sweep: a moving gradient is the
glossy-AI-dashboard cliché this product's visual language rejects (see the "human over AI"
direction in memory / design history); the skeleton bars use a plain `animate-pulse`
breathe instead. `AppLayout`'s `Navbar`/`Footer` are not part of this boundary, they stay
mounted through the transition, only the page body swaps.

The "Launch app" link in `NavigationBar` (`(marketing)`) intercepts its own click and
drives `router.push('/app')` inside `useTransition`, so `isPending` covers the same window
`loading.tsx` fills. While pending, the button's own label switches to a blinking
`Launching...` state (reusing the `animate-blink` cursor glyph from `Button`'s `loading`
prop): this is the instant per-click feedback, and `loading.tsx` is what fills the gap
after that. Once the real `DashboardPage` commits, the existing `panel-in` stagger (`Cell`
in `app/page.tsx`) is the landing animation. `loading.tsx` intentionally does not add one
of its own, so the wait and the arrival stay two clearly separate animations rather than
one that fights itself.

---

## 3. Code style

### Comments

Applies to Cairo, Rust, TypeScript, and JavaScript.

- Section dividers are exactly `// === Section Name`. Never `// --- x ---`, never box
  drawing characters, never a row of equals signs.
- Single line is `//`, anywhere.
- Multi line outside JSX markup is plain `/* ... */`, with no braces.
- `{/* ... */}` **only** inside a returned JSX tree, where a child must be a valid JS
  expression. It is invalid anywhere else, including Rust, Cairo, and plain TS logic.
- Vue `<template>` blocks use `<!-- ... -->`. Vue `<script>` blocks use `//` and `/* */`.
- Comment the non-obvious why, not the what.

### Prose, markdown, and the em dash rule

No em dash character used as prose punctuation, anywhere. That means all of:

- code comments, both `//` and `/* */`
- README and other markdown files
- `console.log`, `console.error`, `console.warn`, and `Error` messages
- user-facing UI copy and page metadata
- LLM system prompts and canned agent replies
- commit messages and PR descriptions

Do not swap in a hyphen as a replacement. Rewrite so neither character is needed. A colon
usually works for a label followed by its description. A comma or a full stop usually
works mid-sentence. Hyphens remain correct for compound words, prefixes, and ranges.

```
BAD   console.error("policy submitted — tx:", tx)
BAD   console.error("policy submitted - tx:", tx)
GOOD  console.error("policy submitted, tx:", tx)

BAD   - **MCP** — Cursor, VS Code, Kiro
GOOD  - **MCP**: Cursor, VS Code, Kiro
```

**The one exception is the em dash as a UI glyph.** Rendered as an empty-value
placeholder it is a deliberate typographic choice, not prose, and it stays. A hyphen
there reads as a typo. The test is whether the character punctuates a sentence or stands
in for a missing value. Only the second case is allowed.

This now lives in exactly one place, the `placeholder` default of
`src/components/shared/AnimatedNumber.tsx`, which every panel renders its figures
through. Keep it that way rather than scattering the literal across panels.

### Checks

Code quality is verified, not asserted. These are the checks that decide whether a change
is actually done.

This is not a demand to run all of them on every save. Run what the change touched, and
run the full set before calling a piece of work finished or handing it over.

What this repo actually has, from the root unless noted:

| Concern         | Command                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| Lint            | `npm run lint`, which runs eslint at the root and then `next lint`                 |
| Types           | `npm run type-check`, covering both `runtime` and `dashboard`                      |
| Formatting      | `npm run format:check`, or `npm run format` to fix                                 |
| Build, JS       | `npm run build` for kit and runtime, `npm run build -w dashboard` for the frontend |
| Build, Solidity | `forge build` in `contracts/`                                                      |

`npm run build` at the root does **not** build the dashboard. Build that one explicitly.

Husky and lint-staged run a subset on commit, which is a backstop and not a substitute for
running the checks yourself.

The same principle applies to stacks this repo does not currently use. Anywhere Rust
appears, `cargo clippy` and `cargo check` are part of the definition of done alongside
`cargo build`. Anywhere Cairo appears, `scarb fmt --check` and `scarb build` are.

Notes:

- A green type check is not a green build. Next.js only surfaces some failures, such as a
  server component using a client-only API, at build time.
- Treat lint and clippy warnings as failures rather than noise. Reach for `#[allow(...)]`
  or an eslint-disable only with a comment saying why.
- Report results honestly. If a check fails, say so and show the output. If you skipped
  one, say which.

### TypeScript

- **No `any`.** Use `unknown` and narrow with a type guard, or add a generic constraint.
  The permitted exceptions each require an inline `//` comment explaining why: a
  third-party pattern that structurally requires it, a JSON parse boundary, or a dynamic
  loader the type system cannot express.
- **Annotate all state explicitly**, even when inference would work.
  `useState<boolean>(false)`, `useRef<HTMLDivElement | null>(null)`. This is deliberate
  verbosity, chosen for scannability over minimal keystrokes.
- **Explicit return types** on custom hooks and on any non-trivial function.
- `interface` for object shapes and contracts. `type` for unions, intersections, mapped
  and conditional types.
- Component props go in an exported interface named `<ComponentName>Props`.
- Prefer constrained generics (`<T extends Base>`) over bare `<T>`.

#### Data arrays are typed at the definition, never `as const`

```ts
const PROBLEMS: Problem[] = [...]; // yes
const PROBLEMS = [...] as const; // no
```

Declare the shape as an interface in `src/types/index.ts` and annotate the constant with
it. `as const` infers a shape instead of checking one, so a missing or misspelled field is
only caught at the point of use, if at all, and the widening it prevents forces a cast on
every literal:

```ts
accent: 'red' as Accent,  // the cast only exists because nothing was checking
accent: 'red',            // checked against Problem, no cast needed
```

**A cast in a data literal is a signal the array is untyped.** Fix the array, not the
literal. `Problem`, `FlowStep`, `Capability`, `McpTool`, and `GuardFeature` are the
existing examples.

`as const` remains correct for genuinely immutable lookup tables and for ABI definitions,
where viem depends on the literal types.

---

## 4. Layout

### The Section convention

Every top-level section on any page follows this shape.

```tsx
<section className="bg-surface relative h-full w-full" aria-labelledby="hero-heading">
  <div className="mx-auto w-full max-w-container px-section-px py-section-py">{/* content */}</div>
</section>
```

In practice you never write that by hand. `src/components/shared/Section.tsx` is the only
implementation, and every top-level section goes through it so the rule cannot drift as
sections are added.

- The `<section>` element carries `relative`, `w-full`, `h-full`.
- The `<section>` is the only place a section background is set. Background colour,
  background image, and any absolutely positioned decoration belong here, never on the
  inner div. `relative` on the section is what anchors that decoration.
- The inner div carries the width constraint: `mx-auto`, `w-full`, `max-w-container`, and
  the horizontal padding.
- `max-w-container` is a theme token, not a magic number. Never write `max-w-[1600px]`.

On `h-full`: `height: 100%` resolves against the parent, so in normal flow it computes to
`auto` and the section is sized by its content. That is intended. When a section genuinely
needs to fill the viewport, add `min-h-svh`. Use `svh`, not `vh`, so mobile browser chrome
does not cause a jump.

### Backgrounds and the ambient layer

Marketing sections use `bg-surface` and `bg-surface-panel`, **not** `bg-bg` and
`bg-bg-panel`. The surface classes are the same hues at `--surface-alpha` opacity.

This is load-bearing, not decoration. The ambient `DotField` is mounted once in the
marketing layout as `fixed inset-0 -z-10` and tracks the cursor across the whole document.
An opaque section background paints straight over it, which is why the effect was
originally visible only behind the hero. The translucent surfaces are what let one mounted
canvas read as a page-wide background.

`--surface-alpha` in `globals.css` is the single dial for how much shows through. Tune it
there. Never hardcode `bg-bg/60` at a call site.

The hero was previously the deliberate exception and stayed opaque, because it owned a
LaserFlow canvas and a gradient stack that the dot field read as noise underneath. That
canvas is gone, so the hero is now on `bg-surface` like every other section and there is no
exception left to remember.

Two consequences to respect:

- Nothing in the marketing tree may set `transform`, `filter`, `backdrop-filter`, or
  `opacity` on an ancestor of `<main>`. Any of those creates a stacking context, traps the
  `-z-10` layer behind it, and blanks the background site-wide.
- Keep body copy on a surface. Text over a bare section loses contrast against the
  brighter dots.

### Spacing tokens

**Never write a responsive padding ladder like `px-4 sm:px-6 lg:px-8` at a call site.**

Spacing is responsive at the _token_ level. Each token is a CSS variable whose value
changes at the breakpoints, so a single class is already responsive.

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

Definitions live in `globals.css` under `@layer base`. Every value comes from `theme()`
and every breakpoint from `@screen`:

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

This keeps `tailwind.config.js` the single source of truth for both the spacing scale and
the breakpoints. No `640px` and no `1.5rem` literal is duplicated into CSS, so the tokens
cannot drift from the config.

Component-internal padding is out of scope. A table cell's `px-4 py-2` or a button's
`px-3 py-1.5` is part of that component's own scale, not the page gutter.

### Type scale

**Never write a font-size ladder like `text-3xl sm:text-5xl lg:text-6xl`.**

The scale is fluid at the token level. Each entry in `theme.fontSize` is a `clamp()`, so
one class is already responsive and scales continuously rather than stepping at the two
breakpoints:

| Token          | Use                                             |
| -------------- | ----------------------------------------------- |
| `text-display` | The hero headline. One per site.                |
| `text-h1`      | Page-level headings and large figures.          |
| `text-h2`      | Section headings.                               |
| `text-h3`      | Card and subsection headings.                   |
| `text-lead`    | Intro paragraphs directly under a heading.      |
| `text-body`    | Default body copy.                              |
| `text-caption` | Labels, metadata, most mono UI text.            |
| `text-micro`   | Badge and index numerals. The smallest allowed. |

Line height and letter spacing are baked into each token, so `leading-*` and `tracking-*`
are not needed alongside them. Changing a heading size site-wide is a one-line edit in
`tailwind.config.js`.

Tailwind's numeric sizes (`text-sm`, `text-xl`) still exist and are not banned outright,
but new markup should reach for a semantic token first.

### No arbitrary values

`text-[10px]`, `leading-[1.1]`, `h-[420px]`, and `max-w-[1600px]` are all banned in our
own code. If a value is worth using it is worth naming, so add a token to
`tailwind.config.js` and use the canonical utility.

The vendored React Bits components are exempt. They arrive full of arbitrary values and
are not reformatted, per the generated-code rule in section 1.

### Buttons

Every button and button-like link carries:

- `cursor-pointer`. Tailwind's preflight sets `cursor: default` on `button`, so a bare
  `<button>` does **not** get a hand cursor on its own. This is the single most common
  miss.
- `transition-all duration-300 ease-in-out`. `transition-colors` is not enough, because
  variants animate shadow as well as colour.
- A visible `focus-visible` ring, distinct from hover.
- `disabled:cursor-not-allowed` with `disabled:opacity-40` and `disabled:shadow-none`.

The primary variant carries `shadow-cta` **at rest** and clears it with
`hover:shadow-none`. That is deliberate and reads backwards at first glance: the resting
shadow is what makes the primary action findable before the cursor arrives, and removing
it on hover keeps it from competing with the cursor-tracking edge glow, which becomes the
hover affordance. Do not add a hover shadow back.

Full-width on mobile is done with a wrapper, not on the control:
`<div className="mx-auto w-full max-w-sm sm:mx-0 sm:w-auto">`. The button itself is
`w-full` and lets the wrapper decide width and centring.

### Spacing between elements

**Prefer flex or grid with `gap` over `space-y-*`, `space-x-*`, or margin.**

`space-y-*` sets a margin on every child but the first. It leaks into children, breaks
when a child is conditionally rendered or reordered, and fights any child that sets its
own margin. `gap` is owned by the container, applies only between items, and is unaffected
by which children happen to render.

```tsx
<div className="flex flex-col gap-3">   // yes
<div className="space-y-3">             // no
<div className="mt-10">                 // no, put the gap on the parent
```

Reach for margin only to push a single element against its container in a way no parent
gap can express. If you are adding `mt-*` to create rhythm in a list, the parent needs
`gap` instead.

### Responsive

**Only two breakpoints: `sm:` and `lg:`. Never `md:`.**

Mobile first. Write the mobile styles unprefixed, then layer `sm:` and `lg:`. If a layout
seems to need `md:`, the layout is wrong. Pick whichever of `sm:` or `lg:` is the better
transition point and adjust the design.

- unprefixed: mobile, 0px and up
- `sm:` 640px and up, large phone and tablet
- `lg:` 1024px and up, desktop

`md` is deliberately absent from `tailwind.config.js` so it cannot be used by accident.
Any existing `md:` is legacy and gets converted on sight.

Grids follow the same discipline: `grid-cols-1 lg:grid-cols-3`, not
`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, unless the middle step genuinely earns itself
at `sm:`.

---

## 5. Motion and rendering budget

### Engines

Three engines, strictly divided. **Never animate the same property with two of them.**

| Engine                   | Owns                                                  | Where                          |
| ------------------------ | ----------------------------------------------------- | ------------------------------ |
| GSAP + ScrollTrigger     | Scroll-position-driven and timeline-sequenced motion  | `(marketing)` only             |
| Motion (`motion/react`)  | State-driven and lifecycle motion, enter/exit, layout | `(app)` mostly, some marketing |
| CSS / Tailwind keyframes | Everything cheap and always-on                        | Both                           |

Deciding which: **is it triggered by scrolling, or by a React state change?** Scrolling is
GSAP. State is Motion. Always-on ambient loops such as `pulse-green`, `scan`, `blink`,
`crt-flicker`, and the rotating `border-rotate` stay in CSS and must not be ported to JS.

The package is `motion`, imported as `motion/react`. It is not `framer-motion`, though
they are the same library. Do not add `framer-motion` to `package.json`.

GSAP work in React must use the `useGSAP` hook from `@gsap/react`, never a bare
`useEffect`. `useGSAP` handles cleanup and React 18 StrictMode's double-invoked effects.
Without it, ScrollTriggers orphan themselves in development.

GSAP 3.13 and later ship SplitText, ScrollTrigger, ScrollSmoother, and MorphSVG in the
free public npm package under the standard no-charge licence. No Club membership and no
private registry are required.

### Animated borders and glows

Two distinct effects. Do not confuse them.

- `.edge-glow` reacts to the cursor. A radial gradient positioned from `--pointer-x` and
  `--pointer-y`, driven by one delegated `pointermove` listener for the whole route via
  `usePointerGlow` and the `PointerGlow` component. Cheap enough to put on every card and
  panel. Set `--edge-glow-color` inline to tint it per element.
- `.animated-border` runs on its own. A conic gradient rotating around the element's edge.
  Reserved for a small number of high-intent surfaces, currently the install command and
  the MCP config block. More than about two per screen reads as noise.

`.animated-border` depends on `@property --border-angle`. A plain custom property is a
string to the interpolator and would jump from `0deg` to `360deg` with nothing in between,
so the registration is what makes it animate at all. It is hidden outright under reduced
motion, because the global backstop collapses animation duration and would otherwise
freeze the gradient mid-sweep as one bright edge.

### Bundle discipline

Route groups code-split. `(app)` must never pull in GSAP. `(marketing)` must never pull in
the wagmi and RainbowKit stack. If you find yourself importing across that line, the
component belongs in `shared/` and needs splitting.

### WebGL budget

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
| Hero render (`next/image`)                      | 0               | still PNG  |
| `ElectricBorder`                                | 0               | SVG filter |

Allocation:

- **Marketing route: 2 contexts.** `DotField` background (0), the hero render (0, it is a
  still image), two `SpecularButton` CTAs (2). Additional WebGL section backgrounds must
  lazy-mount on scroll into view and unmount on exit so they borrow a slot rather than
  adding one.
- **App route: 1 context maximum.** `DotField` (0), edge glow on all panels (0), and
  optionally `Connect Wallet` as the single `SpecularButton` (1).
- **Never more than 2 WebGL surfaces animating in the viewport at once.**

Every button that is not one of those few gets the CSS edge glow instead. At the size
GuardRail's buttons render, the difference is not perceptible.

Every rAF-driven component must gate its loop on an IntersectionObserver and on
`document.visibilitychange`. Offscreen and background-tab animation is not acceptable.

---

## 6. Accessibility

Treated as a correctness requirement, not a polish pass.

- **No missing `alt`.** Every `<img>` has one. Decorative images get `alt=""` **and**
  `aria-hidden="true"` together. An absent `alt` attribute is a bug.
- **Decorative canvases** get `aria-hidden="true"` and must not be focusable.
- **Real elements.** Anything clickable is a `<button type="button">` or an `<a>`. No
  `onClick` on a bare `div`. If a div is unavoidable it needs `role`, `tabIndex`, and an
  `onKeyDown` handling both Enter and Space.
- **Animated text must be readable.** `SplitText`, `DecryptedText`, `TextType`, `CountUp`,
  and `ShinyText` shred text into per-character spans, which screen readers announce
  letter by letter. Wrap the animated visual in `aria-hidden="true"` and put the plain
  string in an adjacent visually-hidden element.
- **A composite animation is one image.** Where several animated parts form a single
  concept, such as `LiveProductHero`, give the wrapper `role="img"` and a descriptive
  `aria-label` and hide the internals. Narrating four rotating steps is noise, not
  information.
- **`prefers-reduced-motion: reduce` is honoured everywhere.** When set, skip the
  animation and render the final resting state immediately. Never start a rAF loop. The
  CSS backstop in `globals.css` is a safety net, not the mechanism: components branch in
  JS through `usePrefersReducedMotion`.
- **Focus is visible.** `globals.css` sets a green `:focus-visible` outline. Do not remove
  it, and do not set `outline: none` without a replacement.
- **Hover-revealed controls must also respond to focus.** Pair `group-hover:` with
  `focus-within:`, or the control is an invisible keyboard target.
- **Headings are ordered.** One `<h1>` per page. Sections use `<h2>`. Never skip a level
  for styling. Use classes for size.
- **Sections are labelled.** Each `<section>` gets `aria-labelledby` pointing at its
  heading's `id`, or `aria-label` if it has no visible heading.
- **Live regions.** Values that update without user action, such as vault balance, daily
  spend, and timelock countdowns, need `aria-live="polite"`. Errors need
  `aria-live="assertive"`.
- **New tabs are announced.** Any `target="_blank"` link carries visually hidden text
  saying it opens in a new tab.
- **Colour is never the only signal.** The palette leans hard on green for "ok" and red
  for "error". Every status also carries an icon or text label.
- **Contrast.** `text-muted` at `#555555` on `#0a0a0a` is roughly 3.2:1, which fails WCAG
  AA for body text. Acceptable only for large or non-essential text. Anything a user must
  read uses `text-secondary` or brighter.

---

## 7. Shared code

### The rule

If a piece of logic, animation, or layout appears twice, it moves. No exceptions, and this
is checked on review. Extraction targets in order of preference: a hook in `src/hooks/`, a
preset or constant in `src/lib/`, then a component in `src/components/shared/`.

### What already exists

Use these rather than reimplementing them.

| Module                                             | Replaces                                                                                                                                                             |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usePrefersReducedMotion` / `prefersReducedMotion` | Every inline `matchMedia` call                                                                                                                                       |
| `useInViewport`                                    | Every hand-rolled IntersectionObserver                                                                                                                               |
| `useRafLoop`                                       | Every hand-rolled `requestAnimationFrame` loop. Handles tab visibility, delta clamping, and holds the callback in a ref so an inline arrow does not restart the loop |
| `usePointerGlow` / `PointerGlow`                   | Per-element `pointermove` listeners. One delegated listener per route group feeds every `.edge-glow`                                                                 |
| `useCopyToClipboard`                               | Inline clipboard plus timeout state                                                                                                                                  |
| `useCountdown`                                     | Inline countdown intervals                                                                                                                                           |
| `useSectionReveal`                                 | Per-section ScrollTrigger setup                                                                                                                                      |
| `lib/motion-presets.ts`                            | Inline Motion variants, easings, durations                                                                                                                           |
| `lib/accents.ts`                                   | Ad hoc icon and card colours. See section 8                                                                                                                          |
| `components/shared/Section.tsx`                    | Hand-written section wrappers                                                                                                                                        |
| `components/shared/SectionHeading.tsx`             | Hand-wired heading ids and `aria-labelledby`                                                                                                                         |
| `components/shared/AnimatedNumber.tsx`             | Snapping figures, and the `'—'` empty placeholder                                                                                                                    |
| `components/shared/Terminal.tsx`                   | Hand-built code blocks with copy buttons                                                                                                                             |

`EASE_OUT` in `motion-presets.ts` is the cubic-bezier equivalent of GSAP's `power3.out`,
so a Motion transition and a GSAP tween of the same duration feel identical. Use it rather
than inventing a curve.

### Types

A type is declared once, in `src/types/index.ts`, and imported everywhere else. It is a
bug for the same interface to exist in two files, and it has already happened once:
`ExecutedEvent` was declared in both `types/index.ts` and `hooks/useEvents.ts`, and the
two copies had silently diverged.

### React Bits vendoring

React Bits components are copied into `src/components/reactbits/`, not installed as a
dependency. Sources come from the `ts-tailwind` variant of the upstream repo. Once copied
they are our code and our maintenance burden, which is why the set is deliberately small.

Every vendored component is adapted before use: `'use client'`, strict types, project
palette as the default prop values, the accessibility rules above, reduced-motion support,
and IntersectionObserver gating on any rAF loop.

### Never import a barrel that reaches a side effect

This applies to `@/hooks` and `@/components/reactbits` alike, and it has bitten this repo
twice.

**Anything under `src/components/shared/` must deep-import hooks**, because `shared/` is
consumed by `(app)`:

```tsx
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'; // yes
import { usePrefersReducedMotion } from '@/hooks'; // no
```

`hooks/index.ts` re-exports `useSectionReveal`, which calls `gsap.registerPlugin` at
module scope. That is a side effect, so the bundler cannot drop it. Because
`components/shared/index.tsx` is imported by every dashboard panel, one barrel import put
GSAP into the `(app)` bundle and silently broke the route-group rule above. Deep-importing
across `shared/` took `/app` from **282 kB** to **258 kB** First Load.

Marketing sections may import `useSectionReveal` from the barrel. They need GSAP anyway.

### Never import React Bits from the barrel

`src/components/reactbits/index.ts` exists for discoverability and type re-exports only.
**Application code must deep-import the specific file:**

```tsx
import { DotField } from '@/components/reactbits/DotField'; // yes
import { DotField } from '@/components/reactbits'; // no
```

Several of these modules call `gsap.registerPlugin` at module scope, which is a side
effect, so the bundler cannot tree-shake the barrel. Importing `DotField` from it pulls in
`LaserFlow` (three), `Aurora` and `GradientWaves` (ogl), and `MagicBento` (gsap).

This is not theoretical. The marketing route's First Load JS was **456 kB** with barrel
imports and **303 kB** after switching six imports to deep paths, with `three` dropping out
of the initial payload entirely.

Anything three-based must additionally be loaded through `next/dynamic` with `ssr: false`
so it stays out of First Load even where it is used.

Nothing currently imports it. `three` is not in any client chunk on either route, and the
build is checked with `grep -rl WebGLRenderer .next/static/chunks/`, which must return
nothing. Keep it that way.

---

## 8. Colour and accents

The base palette lives in `tailwind.config.js`: `bg`, `bg-panel`, `bg-elevated`, `border`,
`green`, `blue`, `orange`, `red`, `yellow`, plus `cyan`, `violet`, and `pink` for accents.

`src/lib/accents.ts` is the only place a colour is attached to meaning. It maps an
`Accent` to its text, border, background, and glow values. Icons in a sibling set take
their own accent rather than all rendering green.

**Every class string in that file is written out in full and must stay that way.** Tailwind
scans source text, so a constructed name like `` `text-${accent}` `` is never emitted into
the stylesheet and the colour silently disappears in production. Never build these by
interpolation.

`glow` is a raw `rgba` rather than a class because it feeds `--edge-glow-color`, which the
cursor-tracking border reads as a CSS custom property.

### Text colours and contrast

Measured against `#0a0a0a`. These values were chosen to clear WCAG AA, not by eye:

| Token            | Value     | Ratio  | Notes                                   |
| ---------------- | --------- | ------ | --------------------------------------- |
| `text-primary`   | `#f4f4f5` | 18.0:1 | Headings and primary copy               |
| `text-secondary` | `#a1a1aa` | 7.7:1  | Body copy, comfortably above AA         |
| `text-muted`     | `#7d7d87` | 4.9:1  | Labels and metadata, clears AA at 4.5:1 |
| `green`          | `#00ff88` | 14.8:1 | Brand, accents, status                  |

The earlier `#555555` muted token was **2.66:1 and failed AA outright**, and `#888888`
secondary was a tight 5.58:1. Do not darken these back for aesthetics. If something reads
too loud, change its size or weight, not its contrast.

These live in two places that must stay in sync: `theme.colors.text` in
`tailwind.config.js`, and the `--text-*` custom properties in `globals.css` that `body`
reads.

### Gradient text

`.text-gradient` is for **one phrase in the hero headline**. It is not a general heading
style, and a page with two of them has none.

It is plain CSS (`background-clip: text`) rather than a component, because a vendored
`GradientText` would mean another client component for what is a handful of declarations.

It ships a `forced-colors: active` fallback and this is not optional. Clipping a background
to text requires transparent glyphs, and forced-colors mode discards backgrounds, so
without the fallback the text disappears completely for those users.

### The logo

`components/shared/AppLogo.tsx` is the only lockup. It renders inline SVG, not the PNG in
`docs/Screens/`, so it stays crisp at any size, inherits `currentColor`, costs no image
request, and cannot shift layout. Variants are `mark` and `full`, sizes `sm` to `lg`.

The mark is duplicated by hand as raw SVG in `app/icon.tsx` and `app/opengraph-image.tsx`.
That is intentional: both render through Satori, which supports a subset of SVG and cannot
import React components. Keep the three in sync when the mark changes.

The favicon deliberately **drops the dashed centre line**. At 32px the dashes collapse into
the rails and the glyph turns into a solid block, so it keeps only the silhouette that
survives at that size.

---

## 9. Content and data

### The canonical site URL

`SITE.url` in `src/lib/seo.ts` is the only place the public origin is written.
`metadataBase`, every canonical, the OG image base, the sitemap, and `robots.txt` all
derive from it, so changing the site's domain is a one-line edit there. Never write the
origin as a literal anywhere else.

It reads `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guardrail.dev'`. The env var is
**optional**, and the fallback is a real value rather than a required setting, because the
origin is not a secret and there is no reason for the build to fail without it.

Ordinary local development does not need the override. `SITE.url` only affects
`metadataBase`, canonicals, `og:url`, `robots.txt`, and the sitemap, none of which change
how a page renders or behaves. Nothing dereferences a canonical while you browse. Set the
override only when a crawler has to fetch the OG image from the URL in the tag: testing
social cards through a tunnel, or a preview deploy that should reference itself.

The fallback is a **placeholder until the site is deployed**.

### Stats without backend changes

The backend and contracts are frozen. Homepage figures come from what is already exposed.

- **Live.** `getLiveContractStats()` in `src/lib/contract-stats.ts` reads the chain through
  the shared viem client. It never throws: a dead RPC yields a zeroed shape with
  `unavailable: true`, and `LiveProofStrip` renders "Unavailable" rather than presenting
  zeros as real figures. It reads viem directly rather than fetching our own
  `/api/contract`, because a server component calling its own API route costs an extra
  round trip and breaks whenever the origin is not what the request thinks it is.
- **Derived constants.** 2 chains, 8 MCP tools, 6 guard types, 10 minute timelock, 2-step
  role transfers. These are facts from the contract and README and live in
  `src/lib/marketing-stats.ts`. Rendering a constant through `CountUp` is legitimate.
- **Not doing.** Lifetime transaction counts and total value routed would require indexing
  full contract history. `GET /api/events` deliberately avoids that with a 115k block
  lookback and a chunk cap to keep latency predictable. Do not extend it.

Note that `TIMELOCK_MINUTES` is a compile-time constant in AgentWallet and differs per
deployment: 10 minutes on Sepolia, 1 minute on the BOT Chain testnet where it was shortened
for demo iteration. The marketing figure quotes the Sepolia value.

### The hero

Two things share the hero and should not be confused.

The **hero render** is the centrepiece: a still 3D plate at
`dashboard/public/hero/ai-gateway.png`, served through `next/image` with `priority` because
it is the LCP element. It is capped by the `max-w-hero-art` token (550px) and centred with
`mx-auto` when the layout stacks below `lg`.

It replaced `LaserFlow`, a three-based WebGL beam that was the largest entry in the
marketing bundle. The still carries the whole product narrative in one frame, agent to
intent to policy gate to settled transaction, which the beam never did, and it costs zero
WebGL contexts. `three` left the bundle entirely with it.

Two consequences:

- `HeroSection` has no `'use client'`. Nothing in it is stateful, so it renders on the
  server and the LCP image is in the initial HTML. `ShinyText` and `SpecularButton` draw
  their own client boundaries and take only serialisable props. Do not add state here
  without weighing that.
- The source art is `docs/Screens/AI_Gateway_.png` and the served copy is
  `dashboard/public/hero/ai-gateway.png`. They are two files, so replacing one and not the
  other silently leaves the site on the old art. `docs/Screens/` was gitignored until the
  hero needed it; if that line in `.gitignore` is ever restored, the source stops being
  tracked while the served copy keeps working, which is a trap worth knowing about.

`animate-art-float` gives the plate a slow 9s drift. A still that never moves beside an
animated ambient background reads as a failed asset load.

`LiveProductHero` is the stronger idea and is implemented in
`src/components/marketing/LiveProductHero.tsx`. It is the product itself, running: a
scripted loop of the agent requesting a transfer, the policy checking it, the transaction
clearing, and the daily limit bar filling. Values are illustrative and not read from chain,
so the hero never depends on RPC availability. It shows the product instead of decorating
around it, and it needs no 3D pipeline.
