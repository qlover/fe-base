import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import type { UserServiceInterface } from '@/server/port/UserServiceInterface';
import { UserService } from '@/server/services/UserService';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    const userService: UserServiceInterface = IOC(UserService);

    await userService.login(body);

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
