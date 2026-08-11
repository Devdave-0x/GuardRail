import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/*
  Apple touch icon, same geometry as AppLogo's mark (see AppLogo.tsx), redrawn at
  180x180 per Apple's own guidance for the home-screen and Safari-favourites size. iOS
  applies its own corner mask and drop shadow to whatever is served here, so this stays
  a flat opaque square with no rounding of its own, unlike icon.tsx's 32px favicon,
  which needs the radius because browsers do not mask it.

  Keeps the dashed centre line that the 32px favicon drops: at 180px there is room for
  the full mark to read clearly. Keep this, icon.tsx, and AppLogo.tsx in sync by hand if
  the mark ever changes, same as the note in icon.tsx.
*/
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}
    >
      <svg
        width="112"
        height="94"
        viewBox="0 0 48 40"
        fill="none"
        stroke="#00ff88"
        strokeWidth={4}
        strokeLinecap="square"
      >
        <path d="M13 4 H5 V36 H13" />
        <path d="M35 4 H43 V36 H35" />
        <path d="M12 16 H36" />
        <path d="M12 24 H36" />
        <path d="M24 5 V35" strokeDasharray="4 4" strokeWidth={3} />
      </svg>
    </div>,
    size,
  );
}
