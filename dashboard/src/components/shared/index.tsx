'use client';

import { ReactNode } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { formatAddress, getEtherscanLink, cn } from '@/lib/utils';
import { useCopyToClipboard, useCountdown } from '@/hooks';

// === Panel
export interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  status?: 'ok' | 'warn' | 'error' | 'info';
  actions?: ReactNode;
  loading?: boolean;
  /*
    Cursor-tracking edge glow, coloured by `status`. Pure CSS driven by the single
    delegated pointermove listener in usePointerGlow, so enabling it on every panel
    costs one listener for the page rather than a WebGL context each.
  */
  glow?: boolean;
}

export function Panel({
  title,
  subtitle,
  children,
  className,
  status,
  actions,
  loading,
  glow = true,
}: PanelProps) {
  const resolvedStatus = status ?? 'ok';

  const statusColor = {
    ok: 'border-green/40',
    warn: 'border-orange/60',
    error: 'border-red/60',
    info: 'border-blue-bright/40',
  }[resolvedStatus];

  // Drives the .edge-glow gradient, so the glow matches the panel's state.
  const glowColor = {
    ok: 'rgba(0, 255, 136, 0.6)',
    warn: 'rgba(255, 107, 53, 0.6)',
    error: 'rgba(255, 51, 51, 0.7)',
    info: 'rgba(59, 130, 246, 0.6)',
  }[resolvedStatus];

  return (
    <div
      style={glow ? ({ '--edge-glow-color': glowColor } as React.CSSProperties) : undefined}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-bg-panel',
        glow && 'edge-glow',
        statusColor,
        className,
      )}
    >
      {/* Scanline effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff88 2px, #00ff88 3px)',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-green">
              {title}
            </span>
            {status === 'error' && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
            )}
            {status === 'warn' && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
            )}
          </div>
          {subtitle && <p className="mt-0.5 font-mono text-xs text-text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Body */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
              <span className="animate-blink text-green">█</span>
              <span>LOADING...</span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// === Stat
interface StatProps {
  label: string;
  value: string | ReactNode;
  dim?: boolean;
  color?: 'green' | 'orange' | 'red' | 'blue' | 'default';
}

export function Stat({ label, value, dim, color = 'default' }: StatProps) {
  const valueColor = {
    green: 'text-green',
    orange: 'text-orange',
    red: 'text-red',
    blue: 'text-blue-bright',
    default: 'text-text-primary',
  }[color];

  return (
    <div className={cn('flex flex-col gap-1', dim && 'opacity-60')}>
      <p className="font-mono text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className={cn('font-mono text-sm font-bold', valueColor)}>{value}</p>
    </div>
  );
}

// === Address
interface AddressDisplayProps {
  address: string;
  label?: string;
  etherscan?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  label,
  etherscan = true,
  className,
}: AddressDisplayProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className={cn('group flex items-center gap-2', className)}>
      {label && <span className="font-mono text-xs text-text-muted">{label}:</span>}
      <span className="font-mono text-xs text-text-primary">{formatAddress(address)}</span>
      {/*
        Focus-within keeps the controls reachable by keyboard: group-hover alone leaves
        them at opacity 0 while focused, which is a hidden focus target.
      */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => copy(address)}
          aria-label={copied ? 'Address copied' : `Copy address ${address}`}
          className="rounded p-0.5 text-text-muted transition-colors hover:text-green"
        >
          {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
        </button>
        {etherscan && (
          <a
            href={getEtherscanLink(address, 'address')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-0.5 text-text-muted transition-colors hover:text-blue-bright"
          >
            <ExternalLink size={11} aria-hidden="true" />
            <span className="sr-only">
              View {formatAddress(address)} on the explorer (opens in a new tab)
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

// === Badge
interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'orange' | 'red' | 'blue' | 'gray';
  pulse?: boolean;
}

export function Badge({ children, variant = 'green', pulse }: BadgeProps) {
  const styles = {
    green: 'bg-green/10 text-green border-green/30',
    orange: 'bg-orange/10 text-orange border-orange/30',
    red: 'bg-red/10 text-red border-red/30',
    blue: 'bg-blue/10 text-blue-bright border-blue/30',
    gray: 'bg-bg-elevated text-text-secondary border-border',
  }[variant];

  const pulseColor = {
    green: 'bg-green',
    orange: 'bg-orange',
    red: 'bg-red',
    blue: 'bg-blue-bright',
    gray: 'bg-text-secondary',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider',
        styles,
      )}
    >
      {pulse && <span className={cn('h-1.5 w-1.5 animate-pulse rounded-full', pulseColor)} />}
      {children}
    </span>
  );
}

// === ProgressBar
interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  warn?: number;
  danger?: number;
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  warn = 70,
  danger = 90,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = clamped >= danger ? '#ff3333' : clamped >= warn ? '#ff6b35' : '#00ff88';

  return (
    <div className="flex flex-col gap-1">
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="font-mono text-xs text-text-muted">{label}</span>}
          {showPercent && (
            <span className="font-mono text-xs font-bold" style={{ color }}>
              {clamped.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full border border-border bg-bg-elevated">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
    </div>
  );
}

// === Button
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'warn' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'ghost',
  disabled,
  loading,
  size = 'md',
  className,
  type = 'button',
}: ButtonProps) {
  const base =
    'font-mono font-bold tracking-wider uppercase transition-all duration-150 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  // Size names, not breakpoints. `md` here is the default button scale.
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
  };
  const variants = {
    primary:
      'bg-green/10 border-green/50 text-green hover:bg-green/20 hover:border-green hover:shadow-green-sm',
    danger: 'bg-red/10 border-red/50 text-red hover:bg-red/20 hover:border-red',
    warn: 'bg-orange/10 border-orange/50 text-orange hover:bg-orange/20 hover:border-orange',
    ghost:
      'bg-transparent border-border text-text-secondary hover:border-border-bright hover:text-text-primary',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {loading ? (
        <>
          <span className="animate-blink">█</span> WAIT...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// === Input
interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  type?: string;
}

export function Input({
  value,
  onChange,
  placeholder,
  label,
  className,
  type = 'text',
}: InputProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="font-mono text-xs uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-border bg-bg-elevated px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted transition-colors focus:border-green/50 focus:bg-bg-hover focus:outline-none"
      />
    </div>
  );
}

// === Countdown

interface CountdownProps {
  unlockTimeMs: number;
  /* Supply the queue time to get a progress value alongside the label. */
  startTimeMs?: number;
}

export function Countdown({ unlockTimeMs, startTimeMs }: CountdownProps) {
  const { display, ready } = useCountdown(unlockTimeMs, startTimeMs);

  return (
    <span
      // Timelocks resolve without user action, so announce the change politely.
      aria-live="polite"
      className={cn('font-mono text-xs font-bold', ready ? 'text-green' : 'text-orange')}
    >
      {display}
    </span>
  );
}
