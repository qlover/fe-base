export const AsyncStoreStatus = Object.freeze({
  DRAFT: 'draft',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  STOPPED: 'stopped'
});

export type AsyncStoreStatusType =
  (typeof AsyncStoreStatus)[keyof typeof AsyncStoreStatus];
