import type { ImageResponse } from 'next/og';

export type ShareCardImageInputType = {
  readonly siteUrl: string;
  readonly tagline?: string;
  readonly description?: string;
};

/**
 * Renders the default Open Graph / Twitter share image.
 */
export interface ShareCardImageServiceInterface {
  render(input: ShareCardImageInputType): Promise<ImageResponse>;
}
