import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { StringEncryptor } from '@/base/cases/StringEncryptor';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import type { UserServiceInterface } from '@/server/port/UserServiceInterface';
import { ServerAuth } from '@/server/ServerAuth';
import { UserService } from '@/server/services/UserService';
import { LoginValidator } from '@/server/validators/LoginValidator';
import type { UserSchema } from '@migrations/schema/UserSchema';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    const requestBody = await req.json();

    try {
      if (requestBody.password) {
        requestBody.password = IOC(StringEncryptor).decrypt(
          requestBody.password
        );
      }
    } catch {
      throw new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }
    const body = IOC(LoginValidator).getThrow(requestBody);

    const userService: UserServiceInterface = IOC(UserService);

    const user = (await userService.login(body)) as UserSchema;

    await IOC(ServerAuth).setAuth(user.credential_token);

    return user;
  });

  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
