import {
  COMMON_HEADER_NAV_ABOUT,
  COMMON_HEADER_NAV_DEMO_UI,
  COMMON_HEADER_NAV_DEVELOPER,
  COMMON_HEADER_NAV_DOCS
} from '../i18n-identifier/common/common';

export const headerNavI18n = Object.freeze({
  navDocs: COMMON_HEADER_NAV_DOCS,
  navAbout: COMMON_HEADER_NAV_ABOUT,
  navDeveloper: COMMON_HEADER_NAV_DEVELOPER,
  navDemoUi: COMMON_HEADER_NAV_DEMO_UI
});

export type HeaderNavI18nInterface = typeof headerNavI18n;
