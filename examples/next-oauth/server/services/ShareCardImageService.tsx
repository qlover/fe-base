import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SITE_SHARE } from '@config/siteShare';
import type {
  ShareCardImageInputType,
  ShareCardImageServiceInterface
} from '@server/interfaces/ShareCardImageServiceInterface';
import { ShareCardImage } from '@server/render/ShareCardImage';

const LOGO_PATH = join(process.cwd(), 'public', 'logo.svg');

/**
 * Share card image: brand logo + Latin-safe layout.
 * CJK copy is omitted when no custom font is loaded (build stays offline-safe).
 */
export class ShareCardImageService implements ShareCardImageServiceInterface {
  /**
   * @override
   */
  public async render(input: ShareCardImageInputType): Promise<ImageResponse> {
    const logoDataUri = await this.readLogoDataUri();
    const host = new URL(input.siteUrl).host;
    // Without a CJK font subset, only render Latin-safe site name + host.
    return new ImageResponse(
      <ShareCardImage
        logoDataUri={logoDataUri}
        siteName={SITE_SHARE.siteName}
        host={host}
      />,
      { ...SITE_SHARE.imageSize }
    );
  }

  protected async readLogoDataUri(): Promise<string> {
    try {
      const svg = await readFile(LOGO_PATH);
      return `data:image/svg+xml;base64,${svg.toString('base64')}`;
    } catch {
      // 1x1 transparent PNG
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    }
  }
}
