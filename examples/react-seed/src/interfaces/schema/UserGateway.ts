import z from 'zod';

export const LoginDataSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(50)
});

export type UserGatewayLoginData = z.infer<typeof LoginDataSchema>;
