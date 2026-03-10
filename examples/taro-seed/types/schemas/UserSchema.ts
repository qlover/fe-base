export interface UserSchema {
  userId: string;
  phoneNumber: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface UserCredentialSchema extends UserSchema {
  access_token: string;
}

export interface LoginRequestSchema {
  code: string;
}
