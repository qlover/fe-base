import { NextResponse, type NextRequest } from 'next/server';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const locale = searchParams.locale as LocaleType;

  if (!locale || !i18nConfig.supportedLngs.includes(locale)) {
    return NextResponse.json({}, { status: 404 });
  }

  return NextResponse.json(i18nConfig);
}
