import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/*
  Generated favicon, so there is no .ico binary to keep in sync with the palette. The
  mark is the same pulsing green dot the navbar uses as the live indicator.
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
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 9999,
          background: '#00ff88',
          boxShadow: '0 0 10px #00ff88',
        }}
      />
    </div>,
    size,
  );
}
