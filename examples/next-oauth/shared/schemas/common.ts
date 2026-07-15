import { z } from 'zod';
import { V_INVALID_ID } from '@config/i18n-identifier/common/validators';
import type { ValueOf } from '@qlover/fe-corekit';

export const uuidSchema = z.uuid({
  error: V_INVALID_ID
});

/**
 * Soft-delete flag used by DB rows (rows are not physically removed).
 *
 * - int 0: not deleted
 * - int 1: deleted
 */
export const DeleteStatus = {
  DELETE: 1,
  UNDELETE: 0
} as const;

export type UUIDType = z.infer<typeof uuidSchema>;
export type SchemaDeletesType = ValueOf<typeof DeleteStatus>;
