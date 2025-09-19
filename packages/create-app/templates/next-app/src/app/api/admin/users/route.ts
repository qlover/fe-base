import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from '@/server/AppErrorApi';
import { AppSuccessApi } from '@/server/AppSuccessApi';
import { AdminAuthPlugin } from '@/server/services/AdminAuthPlugin';
import { ApiUserService } from '@/server/services/ApiUserService';
import { PaginationValidator } from '@/server/validators/PaginationValidator';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server
    .use(new AdminAuthPlugin())
    .execNoError(async ({ parameters: { IOC } }) => {
      const searchParams = Object.fromEntries(
        req.nextUrl.searchParams.entries()
      );
      const paginationParams = IOC(PaginationValidator).getThrow(searchParams);

      const apiUserService = IOC(ApiUserService);

      const result = await apiUserService.getUsers({
        page: paginationParams.page,
        pageSize: paginationParams.pageSize
      });

      return result;
    });

  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
