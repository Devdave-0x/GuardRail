import { publicClient } from './account.js';

// viem throws errors carrying a shortMessage; fall back through message, then the raw value.
function failureReason(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const { shortMessage, message } = err as { shortMessage?: unknown; message?: unknown };
    if (typeof shortMessage === 'string') return shortMessage;
    if (typeof message === 'string') return message;
  }
  return String(err);
}

export async function simulateBeforeSend(to: string, value: bigint, data?: `0x${string}`) {
  try {
    await publicClient.call({ to: to as `0x${string}`, value, data: data || '0x' });
    return { safe: true };
  } catch (err: unknown) {
    return { safe: false, reason: failureReason(err) };
  }
}
