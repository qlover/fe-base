import * as commonKeys from '../i18n-identifier/common/common';
import * as i18nKeys from '../i18n-identifier/pages/page.demo-ui';

/**
 * Demo UI page i18n interface
 */
export type DemoUiI18nInterface = typeof demoUiI18n;

export const demoUiI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_DEMO_UI_TITLE,
  description: i18nKeys.PAGE_DEMO_UI_DESCRIPTION,
  content: i18nKeys.PAGE_DEMO_UI_DESCRIPTION,
  keywords: i18nKeys.PAGE_DEMO_UI_KEYWORDS,

  heading: i18nKeys.PAGE_DEMO_UI_HEADING,
  intro: i18nKeys.PAGE_DEMO_UI_INTRO,

  sectionButton: i18nKeys.PAGE_DEMO_UI_SECTION_BUTTON,
  sectionButtonDesc: i18nKeys.PAGE_DEMO_UI_SECTION_BUTTON_DESC,
  sectionTooltip: i18nKeys.PAGE_DEMO_UI_SECTION_TOOLTIP,
  sectionDropdown: i18nKeys.PAGE_DEMO_UI_SECTION_DROPDOWN,
  sectionDropdownDesc: i18nKeys.PAGE_DEMO_UI_SECTION_DROPDOWN_DESC,
  sectionModal: i18nKeys.PAGE_DEMO_UI_SECTION_MODAL,
  sectionModalDesc: i18nKeys.PAGE_DEMO_UI_SECTION_MODAL_DESC,
  sectionToast: i18nKeys.PAGE_DEMO_UI_SECTION_TOAST,
  sectionToastDesc: i18nKeys.PAGE_DEMO_UI_SECTION_TOAST_DESC,
  sectionAntd: i18nKeys.PAGE_DEMO_UI_SECTION_ANTD,
  sectionAntdDesc: i18nKeys.PAGE_DEMO_UI_SECTION_ANTD_DESC,

  openModal: i18nKeys.PAGE_DEMO_UI_OPEN_MODAL,
  modalTitle: i18nKeys.PAGE_DEMO_UI_MODAL_TITLE,
  modalBody: i18nKeys.PAGE_DEMO_UI_MODAL_BODY,
  confirm: i18nKeys.PAGE_DEMO_UI_CONFIRM,
  cancel: commonKeys.COMMON_CANCEL,
  ok: i18nKeys.PAGE_DEMO_UI_OK,

  themePrefix: i18nKeys.PAGE_DEMO_UI_THEME_PREFIX,
  themeLight: commonKeys.COMMON_THEME_LIGHT,
  themeDark: commonKeys.COMMON_THEME_DARK,
  themePink: commonKeys.COMMON_THEME_PINK,
  disabled: i18nKeys.PAGE_DEMO_UI_DISABLED,

  placementTop: i18nKeys.PAGE_DEMO_UI_PLACEMENT_TOP,
  placementBottom: i18nKeys.PAGE_DEMO_UI_PLACEMENT_BOTTOM,
  placementLeft: i18nKeys.PAGE_DEMO_UI_PLACEMENT_LEFT,
  placementRight: i18nKeys.PAGE_DEMO_UI_PLACEMENT_RIGHT,

  toastSuccess: i18nKeys.PAGE_DEMO_UI_TOAST_SUCCESS,
  toastInfo: i18nKeys.PAGE_DEMO_UI_TOAST_INFO,
  toastWarn: i18nKeys.PAGE_DEMO_UI_TOAST_WARN,
  toastError: i18nKeys.PAGE_DEMO_UI_TOAST_ERROR,
  confirmTitle: i18nKeys.PAGE_DEMO_UI_CONFIRM_TITLE,
  confirmContent: i18nKeys.PAGE_DEMO_UI_CONFIRM_CONTENT,
  confirmDone: i18nKeys.PAGE_DEMO_UI_CONFIRM_DONE,

  colName: i18nKeys.PAGE_DEMO_UI_COL_NAME,
  colRole: i18nKeys.PAGE_DEMO_UI_COL_ROLE
});
