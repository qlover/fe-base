import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse, type NextRequest } from 'next/server';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { ApiLocaleService } from '@/server/services/ApiLocaleService';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const locale = searchParams.locale as LocaleType;

  if (!locale || !i18nConfig.supportedLngs.includes(locale)) {
    return NextResponse.json({}, { status: 404 });
  }

  const server = new BootstrapServer();

  const result = await server.execNoError(async ({ parameters: { IOC } }) => {
    const localesService = IOC(ApiLocaleService);
    const result = await localesService.getLocalesJson(locale);

    return result;
  });

  if (result instanceof ExecutorError) {
    console.error(result);
    return NextResponse.json(
      {},
      {
        status: 400
      }
    );
  }

  return NextResponse.json(result);
}
