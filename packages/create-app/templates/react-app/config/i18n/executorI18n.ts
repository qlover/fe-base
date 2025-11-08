import * as i18nKeys from '../Identifier/pages/page.executor';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type ExecutorI18nInterface = typeof executorI18n;

export const executorI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_EXECUTOR_TITLE,
  description: i18nKeys.PAGE_EXECUTOR_DESCRIPTION,
  content: i18nKeys.PAGE_EXECUTOR_DESCRIPTION,
  keywords: i18nKeys.PAGE_EXECUTOR_KEYWORDS,

  mainTitle: i18nKeys.PAGE_EXECUTOR_MAIN_TITLE,
  testPluginTitle: i18nKeys.PAGE_EXECUTOR_TEST_PLUGIN_TITLE,
  taskStatusPending: i18nKeys.PAGE_EXECUTOR_TASK_STATUS_PENDING,
  taskStatusRunning: i18nKeys.PAGE_EXECUTOR_TASK_STATUS_RUNNING,
  taskStatusCompleted: i18nKeys.PAGE_EXECUTOR_TASK_STATUS_COMPLETED,
  taskStatusFailed: i18nKeys.PAGE_EXECUTOR_TASK_STATUS_FAILED,
  taskTypeDataSync: i18nKeys.PAGE_EXECUTOR_TASK_TYPE_DATA_SYNC,
  taskTypeReport: i18nKeys.PAGE_EXECUTOR_TASK_TYPE_REPORT,
  taskTypeMaintenance: i18nKeys.PAGE_EXECUTOR_TASK_TYPE_MAINTENANCE,
  taskTypeBackup: i18nKeys.PAGE_EXECUTOR_TASK_TYPE_BACKUP,
  taskDurationUnit: i18nKeys.PAGE_EXECUTOR_TASK_DURATION_UNIT,
  taskStart: i18nKeys.PAGE_EXECUTOR_TASK_START,
  taskStop: i18nKeys.PAGE_EXECUTOR_TASK_STOP,
  taskSuccess: i18nKeys.PAGE_EXECUTOR_TASK_SUCCESS,
  taskFailure: i18nKeys.PAGE_EXECUTOR_TASK_FAILURE,
  pluginTestSuccess: i18nKeys.PAGE_EXECUTOR_PLUGIN_TEST_SUCCESS,
  pluginTestFailure: i18nKeys.PAGE_EXECUTOR_PLUGIN_TEST_FAILURE,
  customTaskUrlRequired: i18nKeys.PAGE_EXECUTOR_CUSTOM_TASK_URL_REQUIRED,
  customTaskName: i18nKeys.PAGE_EXECUTOR_CUSTOM_TASK_NAME,
  createTaskTitle: i18nKeys.PAGE_EXECUTOR_CREATE_TASK_TITLE,
  createButton: i18nKeys.PAGE_EXECUTOR_CREATE_BUTTON,
  enterUrl: i18nKeys.PAGE_EXECUTOR_ENTER_URL,
  taskListTitle: i18nKeys.PAGE_EXECUTOR_TASK_LIST_TITLE,
  taskStatsTotal: i18nKeys.PAGE_EXECUTOR_TASK_STATS_TOTAL,
  taskStatsRunning: i18nKeys.PAGE_EXECUTOR_TASK_STATS_RUNNING,
  taskStatsCompleted: i18nKeys.PAGE_EXECUTOR_TASK_STATS_COMPLETED,
  taskStatsFailed: i18nKeys.PAGE_EXECUTOR_TASK_STATS_FAILED,
  taskHistoryTitle: i18nKeys.PAGE_EXECUTOR_TASK_HISTORY_TITLE,
  helpTitle: i18nKeys.PAGE_EXECUTOR_HELP_TITLE,
  helpDescription: i18nKeys.PAGE_EXECUTOR_HELP_DESCRIPTION,
  viewGuide: i18nKeys.PAGE_EXECUTOR_VIEW_GUIDE,
  contactSupport: i18nKeys.PAGE_EXECUTOR_CONTACT_SUPPORT,
  requestTimeout: i18nKeys.PAGE_EXECUTOR_REQUEST_TIMEOUT
});
