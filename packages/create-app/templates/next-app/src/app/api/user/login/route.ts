import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import type { UserServiceInterface } from '@/server/port/UserServiceInterface';
import { UserService } from '@/server/services/UserService';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const server = new BootstrapServer();

  const result = await server.execNoError(({ parameters: { IOC } }) => {
    const userService: UserServiceInterface = IOC(UserService);

    return userService.login(body);
  });

  if (result instanceof ExecutorError) {
    return NextResponse.json(
      {
        success: false,
        errorId: result.id,
        message: result.message
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result
  });
}
