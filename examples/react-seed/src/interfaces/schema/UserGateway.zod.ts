import { z } from 'zod';
import type { UserGatewayLoginData } from './UserGateway.types';

export const LoginDataSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(50)
});

export type { UserGatewayLoginData };
