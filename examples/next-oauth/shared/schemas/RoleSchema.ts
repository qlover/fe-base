import { z } from 'zod';
import { RoleKind } from '@shared/auth/roleKeys';

export const roleKindSchema = z.enum([RoleKind.Platform]);

export type AppRoleKind = z.infer<typeof roleKindSchema>;

export const adminPermissionItemSchema = z.object({
  permissionKey: z.string(),
  type: z.string(),
  method: z.string().nullable(),
  path: z.string().nullable(),
  description: z.string().nullable()
});

export type AdminPermissionItem = z.infer<typeof adminPermissionItemSchema>;

export const adminRoleItemSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  kind: roleKindSchema,
  description: z.string().nullable(),
  isSystem: z.boolean(),
  permissionKeys: z.array(z.string())
});

export type AdminRoleItem = z.infer<typeof adminRoleItemSchema>;

export const adminRolesResponseSchema = z.object({
  catalog: z.array(adminPermissionItemSchema),
  roles: z.array(adminRoleItemSchema)
});

export type AdminRolesResponse = z.infer<typeof adminRolesResponseSchema>;

export const adminRoleAssignmentsPatchSchema = z.object({
  roleId: z.string().uuid(),
  permissionKeys: z.array(z.string().min(1))
});

export type AdminRoleAssignmentsPatch = z.infer<
  typeof adminRoleAssignmentsPatchSchema
>;

/** Session user with platform RBAC fields (extends next-kit UserSchema). */
export type SessionUserPermissions = {
  system_role: string;
  permissions: string[];
};
