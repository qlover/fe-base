import * as commonKeys from '../i18n-identifier/common/common';
import * as developerAppsKeys from '../i18n-identifier/pages/page.developer.apps';
import { PAGE_HOME_TITLE } from '../i18n-identifier/pages/page.home';

export const developerAppsI18n = Object.freeze({
  // basic meta properties
  /** App brand in header (from page_home; requires page_home in page messages). */
  appBrandTitle: PAGE_HOME_TITLE,
  title: developerAppsKeys.DEVELOPER_APPS_TITLE,
  description: developerAppsKeys.DEVELOPER_APPS_DESCRIPTION,
  content: developerAppsKeys.DEVELOPER_APPS_DESCRIPTION,
  keywords: developerAppsKeys.DEVELOPER_APPS_KEYWORDS,

  // actions
  createButton: developerAppsKeys.DEVELOPER_APPS_CREATE_BUTTON,
  editButton: developerAppsKeys.DEVELOPER_APPS_EDIT_BUTTON,
  deleteButton: developerAppsKeys.DEVELOPER_APPS_DELETE_BUTTON,
  rotateSecretButton: developerAppsKeys.DEVELOPER_APPS_ROTATE_SECRET_BUTTON,

  // labels
  clientIdLabel: developerAppsKeys.DEVELOPER_APPS_CLIENT_ID_LABEL,
  redirectUrisLabel: developerAppsKeys.DEVELOPER_APPS_REDIRECT_URIS_LABEL,
  createdAtLabel: developerAppsKeys.DEVELOPER_APPS_CREATED_AT_LABEL,
  statusEnabled: developerAppsKeys.DEVELOPER_APPS_STATUS_ENABLED,

  // modal titles
  createModalTitle: developerAppsKeys.DEVELOPER_APPS_CREATE_MODAL_TITLE,
  editModalTitle: developerAppsKeys.DEVELOPER_APPS_EDIT_MODAL_TITLE,

  // form fields
  appNameLabel: developerAppsKeys.DEVELOPER_APPS_APP_NAME_LABEL,
  appNameRequired: developerAppsKeys.DEVELOPER_APPS_APP_NAME_REQUIRED,
  redirectUrisPlaceholder:
    developerAppsKeys.DEVELOPER_APPS_REDIRECT_URIS_PLACEHOLDER,
  redirectUrisHint: developerAppsKeys.DEVELOPER_APPS_REDIRECT_URIS_HINT,
  clientUriLabel: developerAppsKeys.DEVELOPER_APPS_CLIENT_URI_LABEL,

  // buttons
  cancelButton: commonKeys.COMMON_CANCEL,
  createSubmitButton: developerAppsKeys.DEVELOPER_APPS_CREATE_SUBMIT_BUTTON,
  saveSubmitButton: developerAppsKeys.DEVELOPER_APPS_SAVE_SUBMIT_BUTTON,

  // confirmations
  deleteConfirmTitle: developerAppsKeys.DEVELOPER_APPS_DELETE_CONFIRM_TITLE,
  deleteConfirmContent: developerAppsKeys.DEVELOPER_APPS_DELETE_CONFIRM_CONTENT,
  rotateSecretConfirmTitle:
    developerAppsKeys.DEVELOPER_APPS_ROTATE_SECRET_CONFIRM_TITLE,
  rotateSecretConfirmContent:
    developerAppsKeys.DEVELOPER_APPS_ROTATE_SECRET_CONFIRM_CONTENT,

  // toasts
  toastCreateSuccess: developerAppsKeys.DEVELOPER_APPS_TOAST_CREATE_SUCCESS,
  toastUpdateSuccess: developerAppsKeys.DEVELOPER_APPS_TOAST_UPDATE_SUCCESS,
  toastDeleteSuccess: developerAppsKeys.DEVELOPER_APPS_TOAST_DELETE_SUCCESS,
  toastRotateSuccess: developerAppsKeys.DEVELOPER_APPS_TOAST_ROTATE_SUCCESS,
  toastError: developerAppsKeys.DEVELOPER_APPS_TOAST_ERROR,

  // empty state
  emptyState: developerAppsKeys.DEVELOPER_APPS_EMPTY_STATE,

  consoleSubtitle: developerAppsKeys.DEVELOPER_APPS_CONSOLE_SUBTITLE,
  credentialsModalTitle:
    developerAppsKeys.DEVELOPER_APPS_CREDENTIALS_MODAL_TITLE,
  clientSecretLabel: developerAppsKeys.DEVELOPER_APPS_CLIENT_SECRET_LABEL,
  secretWarning: developerAppsKeys.DEVELOPER_APPS_SECRET_WARNING,
  credentialsConfirm: developerAppsKeys.DEVELOPER_APPS_CREDENTIALS_CONFIRM,
  copyClientIdSuccess: developerAppsKeys.DEVELOPER_APPS_COPY_CLIENT_ID_SUCCESS,
  copySecretSuccess: developerAppsKeys.DEVELOPER_APPS_COPY_SECRET_SUCCESS,
  loading: developerAppsKeys.DEVELOPER_APPS_LOADING,
  playgroundLink: developerAppsKeys.DEVELOPER_APPS_PLAYGROUND_LINK,
  clientTypeLabel: developerAppsKeys.DEVELOPER_APPS_CLIENT_TYPE_LABEL,
  clientTypeConfidential:
    developerAppsKeys.DEVELOPER_APPS_CLIENT_TYPE_CONFIDENTIAL,
  clientTypePublic: developerAppsKeys.DEVELOPER_APPS_CLIENT_TYPE_PUBLIC,
  clientTypeHint: developerAppsKeys.DEVELOPER_APPS_CLIENT_TYPE_HINT,
  clientTypeLockedHint:
    developerAppsKeys.DEVELOPER_APPS_CLIENT_TYPE_LOCKED_HINT,
  statusPublic: developerAppsKeys.DEVELOPER_APPS_STATUS_PUBLIC,
  statusConfidential: developerAppsKeys.DEVELOPER_APPS_STATUS_CONFIDENTIAL,
  publicClientNote: developerAppsKeys.DEVELOPER_APPS_PUBLIC_CLIENT_NOTE
});
