import type { BrainCredentials, BrainUser } from '@brain-toolkit/brain-user';

export type UserSchema = BrainUser;

export type UserCredentialSchema = BrainCredentials;

export interface LoginRequestSchema {
  code: string;
}
