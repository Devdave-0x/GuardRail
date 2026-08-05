'use client';
// Stub: wagmi@2.19.5 references sendTransactionSyncMutationOptions from @wagmi/core/query
// but @wagmi/core@2.21.2 doesn't export it. Hook is unused by this app.
export function useSendTransactionSync() {
  return {
    sendTransactionSync: () => {},
    sendTransactionSyncAsync: async () => {},
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
