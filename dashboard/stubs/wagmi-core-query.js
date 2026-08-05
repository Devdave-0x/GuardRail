// Augmented @wagmi/core/query: re-exports the real module plus adds the two
// *SyncMutationOptions functions that wagmi@2.19.5 expects but @wagmi/core@2.21.2 lacks.
export * from '../node_modules/@wagmi/core/dist/esm/exports/query.js';

export function sendCallsSyncMutationOptions() {
  return { mutationKey: ['sendCallsSync'], mutationFn: () => Promise.resolve(undefined) };
}

export function sendTransactionSyncMutationOptions() {
  return { mutationKey: ['sendTransactionSync'], mutationFn: () => Promise.resolve(undefined) };
}
