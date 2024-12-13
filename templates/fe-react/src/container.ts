import { JSONStorage, SyncStorage } from '@qlover/fe-utils';

export const localJsonStorage = new JSONStorage(
  localStorage as unknown as SyncStorage<string>
);
