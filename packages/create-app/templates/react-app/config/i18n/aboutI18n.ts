import * as i18nKeys from '../Identifier/pages/page.about';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type AboutI18nInterface = typeof aboutI18n;

export const aboutI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_ABOUT_TITLE,
  description: i18nKeys.PAGE_ABOUT_DESCRIPTION,
  content: i18nKeys.PAGE_ABOUT_DESCRIPTION,
  keywords: i18nKeys.PAGE_ABOUT_KEYWORDS,

  messageTest: i18nKeys.PAGE_ABOUT_MESSAGE_TEST,
  notificationTitle: i18nKeys.PAGE_ABOUT_NOTIFICATION_TITLE,
  notificationDescription: i18nKeys.PAGE_ABOUT_NOTIFICATION_DESC,
  btnMessage: i18nKeys.PAGE_ABOUT_BTN_MESSAGE,
  btnMessage2: i18nKeys.PAGE_ABOUT_BTN_MESSAGE2,
  btnNotification: i18nKeys.PAGE_ABOUT_BTN_NOTIFICATION,
  btnNotification2: i18nKeys.PAGE_ABOUT_BTN_NOTIFICATION2,
  tooltipText: i18nKeys.PAGE_ABOUT_TOOLTIP_TEXT,
  btnTooltip: i18nKeys.PAGE_ABOUT_BTN_TOOLTIP,
  modalTitle: i18nKeys.PAGE_ABOUT_MODAL_TITLE,
  modalContent: i18nKeys.PAGE_ABOUT_MODAL_CONTENT,
  btnModal: i18nKeys.PAGE_ABOUT_BTN_MODAL,
  drawerTitle: i18nKeys.PAGE_ABOUT_DRAWER_TITLE,
  drawerContent: i18nKeys.PAGE_ABOUT_DRAWER_CONTENT,
  btnDrawer: i18nKeys.PAGE_ABOUT_BTN_DRAWER,
  popoverContent: i18nKeys.PAGE_ABOUT_POPOVER_CONTENT,
  popoverTitle: i18nKeys.PAGE_ABOUT_POPOVER_TITLE,
  btnPopover: i18nKeys.PAGE_ABOUT_BTN_POPOVER,
  popconfirmTitle: i18nKeys.PAGE_ABOUT_POPCONFIRM_TITLE,
  popconfirmDesc: i18nKeys.PAGE_ABOUT_POPCONFIRM_DESC,
  btnPopconfirm: i18nKeys.PAGE_ABOUT_BTN_POPCONFIRM,
  alertMessage: i18nKeys.PAGE_ABOUT_ALERT_MESSAGE,
  okText: i18nKeys.PAGE_ABOUT_OK_TEXT,
  cancelText: i18nKeys.PAGE_ABOUT_CANCEL_TEXT
});
