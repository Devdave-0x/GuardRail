'use client';
// Stub: wagmi@2.19.5 ships useSendCallsSync which requires sendCallsSyncMutationOptions
// from @wagmi/core/query, but @wagmi/core@2.21.2 doesn't export it yet.
// This app doesn't use useSendCallsSync, so we stub it to an inert no-op.
export function useSendCallsSync() {
  return {
    sendCallsSync: () => {},
    sendCallsSyncAsync: async () => {},
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    reset: () => {},
    variables: undefined,
    status: 'idle',
  };
}
