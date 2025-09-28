import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import { AIService } from '@/server/services/AIService';

export async function GET() {
  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    // const requestBody = await req.json();

    const result = await IOC(AIService).completions([
      {
        role: 'user',
        content: 'hello'
      }
    ]);

    return result;
  });

  if (result instanceof ExecutorError) {
    console.log(result);
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
