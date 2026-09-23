import { z } from 'zod';
import { PERMISSION_KEY_PATTERN } from '@shared/auth/permissionKeys';
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

const permissionKeyField = z
  .string()
  .min(1)
  .regex(PERMISSION_KEY_PATTERN, 'Invalid permission_key format');

export const adminPermissionCreateSchema = z.object({
  permissionKey: permissionKeyField,
  type: z.enum(['api', 'page', 'feature']).default('api'),
  method: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export type AdminPermissionCreate = z.infer<typeof adminPermissionCreateSchema>;

export const adminPermissionUpdateSchema = z.object({
  permissionKey: permissionKeyField,
  type: z.enum(['api', 'page', 'feature']).optional(),
  method: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export type AdminPermissionUpdate = z.infer<typeof adminPermissionUpdateSchema>;

export const adminPermissionsResponseSchema = z.object({
  catalog: z.array(adminPermissionItemSchema)
});

export type AdminPermissionsResponse = z.infer<
  typeof adminPermissionsResponseSchema
>;

/** Session user with platform RBAC fields (extends next-kit UserSchema). */
export type SessionUserPermissions = {
  system_role: string;
  permissions: string[];
};
