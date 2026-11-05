import { clsx } from 'clsx';

/** 概览卡片外框；`min-w-0` 让网格项可收缩 */
export const ADMIN_HOME_CARD_CLS = clsx(
  'border-primary-border bg-elevated min-w-0 rounded-2xl border'
);

/** 卡片网格：窄屏单列，大屏三列 */
export const ADMIN_HOME_GRID_CLS = clsx(
  'grid grid-cols-1 gap-4 lg:grid-cols-3'
);

/** 可点击卡片（待办 / 快捷入口） */
export const ADMIN_HOME_LINK_CARD_CLS = clsx(
  ADMIN_HOME_CARD_CLS,
  'block transition hover:border-brand/40'
);

/** 区块小标题 */
export const ADMIN_HOME_SECTION_TITLE_CLS = clsx(
  'text-secondary-text text-xs font-semibold'
);

/** 卡片标题行右侧的跳转链接 */
export const ADMIN_HOME_CARD_LINK_CLS = clsx(
  'text-brand ml-auto text-xs hover:underline'
);
