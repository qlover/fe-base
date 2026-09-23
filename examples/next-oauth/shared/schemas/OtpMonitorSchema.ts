import { z } from 'zod';
import {
  phoneOtpAdminItemSchema,
  type PhoneOtpAdminItem
} from '@schemas/PhoneOtpSchema';

export type OtpMonitorAdminEntry = PhoneOtpAdminItem;

export const otpMonitorListResultSchema = z.object({
  entries: z.array(phoneOtpAdminItemSchema),
  total: z.number().int().nonnegative()
});

export type OtpMonitorListResult = z.infer<typeof otpMonitorListResultSchema>;
