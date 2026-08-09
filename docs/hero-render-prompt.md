# Hero Render Prompt

How the 3D art on the right side of the homepage hero was produced, and what to feed a
tool if it ever needs regenerating.

The shipped asset is a **still**, not a loop: `dashboard/public/hero/ai-gateway.png`. It
replaced the `LaserFlow` WebGL beam, which also removed three.js from the marketing
bundle.

The source file is `docs/Screens/AI_Gateway_.png` and the served copy is
`dashboard/public/hero/ai-gateway.png`. **They are two separate files.** Replacing the
source without copying it across leaves the site on the old art.

The subject is our own `AppLogo` geometry rendered in 3D: two brackets as the policy
boundary, rails as the guard, a dashed centre line as the agent passing through. That
keeps the hero art brand-owned rather than generic stock 3D, and ties it to the nav
lockup.

## If a moving version is ever wanted

The prompt below still carries the `MOTION` and loop requirements, because the original
intent was a looping clip and they cost nothing to keep.

Use Spline (spline.design) or Blender for that. Do not use an AI video model. The clip has
to loop seamlessly, meaning the last frame matches the first exactly, which comes free
from a 360 degree turntable render and is not something video models can guarantee.
Hard-edged geometric product renders also drift and morph between frames in AI video,
which is the worst case for this subject.

## Prompt

```
A slow, seamlessly looping 3D turntable render on a pure black background.

SUBJECT
A vertical monolithic gate made of two thick square brackets facing each
other, like [ and ], standing upright on a dark cylindrical pedestal. The
brackets are brushed dark gunmetal with polished bevelled edges. Between
them float two horizontal bars of frosted glass, edge-lit in bright neon
green (#00ff88). A dashed vertical line of small glowing green cubes runs
up the centre axis, passing between the two bars, with the cubes drifting
slowly upward and fading out at the top.

PEDESTAL
A short dark carbon-fibre cylinder with a polished chrome rim. Around the
rim, six small circular emblems are inset and softly backlit, each a simple
crypto glyph (Ethereum diamond, USDC circle, a generic token disc). The
pedestal rotates slowly and continuously.

LIGHTING
Almost entirely dark. A strong neon green rim light from behind and above
the gate, catching the top edges of the brackets. A single cool cyan
(#22d3ee) accent light from the lower left. One small warm amber highlight
on the pedestal rim for contrast against all the green. Deep shadows, high
contrast, no fill light on the front faces.

CAMERA
Locked off, three-quarter view, slightly below the object looking up so the
gate feels tall. Shallow depth of field, pedestal base slightly soft.

MOTION
One single continuous 360 degree rotation of the pedestal and gate across
the full clip, so the last frame matches the first exactly. Nothing else
moves except the drifting centre cubes. Slow and calm.

STYLE
Premium fintech product render, octane or redshift quality, glossy,
cinematic, dark UI aesthetic. No text, no logos, no words anywhere in the
image.

OUTPUT
1200x1200, 6 to 8 seconds, 30fps, exactly one full rotation, seamless loop.
H.264 MP4 plus a WebM/VP9 fallback. Under 2 MB. Black background, no alpha.
Also export a single PNG still of the first frame as the poster image.
```

If the tool will not take the whole prompt, `SUBJECT` and `LIGHTING` are the
load-bearing parts. `MOTION` and `OUTPUT` are render settings in most 3D tools rather
than prompt text.

## Colours

Taken from `tailwind.config.js`, so the render sits in the same palette as the site.

| Role         | Hex       | Token    |
| ------------ | --------- | -------- |
| Primary neon | `#00ff88` | `green`  |
| Cool accent  | `#22d3ee` | `cyan`   |
| Warm accent  | `#ff6b35` | `orange` |
| Background   | `#0a0a0a` | `bg`     |

## Delivery

A replacement still goes to `dashboard/public/hero/ai-gateway.png`. Square, around 1254px,
on a black background. Size is not a concern: `next/image` converts it, and the current
1.6 MB PNG is served as a 63 kB WebP.

Update the `width` and `height` props in `HeroSection` if the aspect ratio changes, and
re-check the `alt` text, which spells out the gate's checklist and the ring labels and
must keep matching what the image actually shows.

If a moving version ever ships, add `hero-loop.mp4`, `hero-loop.webm`, and
`hero-poster.png` alongside it, and render the poster alone under
`prefers-reduced-motion` rather than loading the video.

## Reference

The look was set against a Vortex FX landing page clip, since deleted from
`docs/Screens/Videos/`. What was taken from it: a near-black stage, a single bright neon
key colour, and an object large enough to hold the right half of the viewport on its own.

Its headline was pure white with no gradient, and all colour lived in the eyebrow, the CTA,
and the render. We went the other way deliberately, keeping the gradient on "AI agent", so
our hero carries colour in both the headline and the art.
