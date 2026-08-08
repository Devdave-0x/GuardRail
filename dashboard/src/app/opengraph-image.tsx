import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/seo';

export const alt = `${SITE.name}: on-chain policy enforcement for autonomous agents`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/*
  Generated rather than a checked-in JPG, so the card never drifts from the copy and
  there is no binary to maintain.

  ImageResponse supports flexbox and a subset of CSS only. No grid, and every element
  with more than one child needs an explicit display: flex.
*/
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0a0a0a',
        padding: 72,
        fontFamily: 'monospace',
        /*
            Satori's gradient parser rejects rgba() inside multi-stop linear-gradients,
            so decoration here stays solid-colour only. A single accent rule reads as
            the terminal chrome without needing a pattern.
          */
        borderTop: '8px solid #00ff88',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 9999,
            background: '#00ff88',
            boxShadow: '0 0 24px #00ff88',
          }}
        />
        <div
          style={{
            fontSize: 28,
            color: '#00ff88',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {SITE.name}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            fontSize: 76,
            color: '#e8e8e8',
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          Give your AI agent a wallet. Keep the keys to the brakes.
        </div>
        <div style={{ fontSize: 28, color: '#888888', maxWidth: 900, lineHeight: 1.4 }}>
          Spending limits, whitelists, and a guardian kill switch, enforced on-chain.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {['PER-TX LIMIT', 'DAILY CAP', 'WHITELIST', 'TIMELOCK', 'KILL SWITCH'].map((label) => (
          <div
            key={label}
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#00ff88',
              border: '1px solid rgba(0,255,136,0.35)',
              background: 'rgba(0,255,136,0.06)',
              borderRadius: 6,
              padding: '8px 14px',
              letterSpacing: 1,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
