import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/*
  Generated favicon, so there is no .ico binary to keep in sync with the palette.

  This is the AppLogo mark: brackets enclosing two rails, split by a dashed centre line.
  It is redrawn as raw SVG rather than importing AppLogo because ImageResponse renders
  through Satori, which supports only a subset of SVG and no external components. Keep
  the two in sync by hand; the geometry is deliberately simple enough for that.

  Proportions are scaled up from AppLogo's 48x40 viewBox and the strokes thickened, since
  at 32px the component's hairlines would disappear.
*/
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        borderRadius: 6,
      }}
    >
      {/*
          The dashed centre line is dropped at this size. At 32px its dashes collapse into
          the rails and the whole glyph reads as a solid block, so the favicon keeps only
          the silhouette that survives: brackets plus two rails.
        */}
      <svg
        width="24"
        height="20"
        viewBox="0 0 48 40"
        fill="none"
        stroke="#00ff88"
        strokeWidth={5}
        strokeLinecap="square"
      >
        <path d="M14 4 H5 V36 H14" />
        <path d="M34 4 H43 V36 H34" />
        <path d="M13 15 H35" />
        <path d="M13 25 H35" />
      </svg>
    </div>,
    size,
  );
}
