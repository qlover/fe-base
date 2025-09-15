import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import type { UserServiceInterface } from '@/server/port/UserServiceInterface';
import { UserService } from '@/server/services/UserService';

export async function POST() {
  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    const userService: UserServiceInterface = IOC(UserService);

    await userService.logout();

    return true;
  });

  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
