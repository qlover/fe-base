import { z } from 'zod';
import { V_INVALID_ID } from '@config/i18n-identifier/common/validators';

export const uuidSchema = z.uuid({
  error: V_INVALID_ID
});

export type UUIDType = z.infer<typeof uuidSchema>;
