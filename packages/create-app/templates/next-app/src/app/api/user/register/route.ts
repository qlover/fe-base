import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import type { UserServiceInterface } from '@/server/port/UserServiceInterface';
import { UserService } from '@/server/services/UserService';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const server = new BootstrapServer();
  const userService: UserServiceInterface = server.getIOC(UserService);

  try {
    const user = await userService.register(body);

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
