import { SITE_SHARE } from '@config/siteShare';
import { ServerConfig } from '@server/ServerConfig';
import { ShareCardImageService } from '@server/services/ShareCardImageService';
import type { ImageResponse } from 'next/og';

export const alt = SITE_SHARE.siteName;
export const size = SITE_SHARE.imageSize;
export const contentType = SITE_SHARE.imageContentType;

/**
 * Default share image for this locale tree (`og:image` / Twitter card).
 * Next.js App Router 约定本文件必须 default export。
 */
export default async function Image(): Promise<ImageResponse> {
  return new ShareCardImageService().render({
    siteUrl: new ServerConfig().siteUrl
  });
}
