import { z } from 'zod';
import { SystemRole } from '@shared/auth/systemRole';

const systemRoleSchema = z.enum([
  SystemRole.User,
  SystemRole.Operator,
  SystemRole.Admin
]);

export const adminUserListItemSchema = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  phone: z.string().nullable().optional(),
  displayName: z.string().nullable(),
  systemRole: systemRoleSchema,
  status: z.enum(['active', 'suspended']),
  createdAt: z.string()
});

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;

/** PATCH /api/admin/users/:userId/system-role */
export const adminSystemRolePatchSchema = z.object({
  systemRole: systemRoleSchema
});

export type AdminSystemRolePatch = z.infer<typeof adminSystemRolePatchSchema>;
