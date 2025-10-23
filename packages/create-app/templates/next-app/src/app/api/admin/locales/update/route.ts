import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import { AdminAuthPlugin } from '@/server/services/AdminAuthPlugin';
import { ApiLocaleService } from '@/server/services/ApiLocaleService';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server
    .use(new AdminAuthPlugin())
    .execNoError(async ({ parameters: { IOC } }) => {
      const requestBody = await req.json();
      const adminLocalesService = IOC(ApiLocaleService);
      await adminLocalesService.update(requestBody);
      return {
        success: true
      };
    });

  if (result instanceof ExecutorError) {
    console.error(result);
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
