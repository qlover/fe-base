/* eslint-disable @next/next/no-img-element -- satori only accepts native img */
import { SITE_SHARE } from '@config/siteShare';
import type { ReactElement } from 'react';

export type ShareCardImagePropsType = {
  readonly logoDataUri: string;
  readonly siteName: string;
  /** Host without protocol */
  readonly host: string;
  readonly tagline?: string;
  readonly description?: string;
};

const { colors } = SITE_SHARE;

/**
 * Share-card layout for `next/og` / satori (inline styles + flex only).
 */
export function ShareCardImage({
  logoDataUri,
  siteName,
  host,
  tagline,
  description
}: ShareCardImagePropsType): ReactElement {
  return (
    <div
      data-testid="ShareCardImage"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.paper,
        color: colors.ink
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 88px',
          gap: 64
        }}
      >
        <img src={logoDataUri} width={220} height={220} alt="" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1
            }}
          >
            {siteName}
          </div>
          {tagline ? (
            <div
              style={{
                marginTop: 28,
                fontSize: 40,
                fontWeight: 700,
                color: colors.brand
              }}
            >
              {tagline}
            </div>
          ) : null}
          {description ? (
            <div
              style={{
                marginTop: 20,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.45,
                color: colors.inkSoft
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>
      <div
        style={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 88px',
          backgroundColor: colors.brand,
          color: colors.paper,
          fontSize: 28,
          fontWeight: 700
        }}
      >
        <div>{host}</div>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: colors.brandDeep
          }}
        />
      </div>
    </div>
  );
}
