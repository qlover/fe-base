import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { StringEncryptor } from '@/base/cases/StringEncryptor';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import type { UserServiceInterface } from '@/server/port/UserServiceInterface';
import { UserService } from '@/server/services/UserService';
import { LoginValidator } from '@/server/validators/LoginValidator';
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
      return new ExecutorError(
        'encrypt_password_failed',
        'Encrypt password failed'
      );
    }

    const body = IOC(LoginValidator).getThrow(requestBody);

    const userService: UserServiceInterface = IOC(UserService);

    await userService.register({
      email: body.email,
      password: body.password
    });

    return {
      token: '1234567890'
    };
  });

  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
