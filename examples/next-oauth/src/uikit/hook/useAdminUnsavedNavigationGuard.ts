'use client';

import { useNavigationGuard } from '@qlover/next-kit/client';
import { useCallback } from 'react';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import {
  COMMON_CANCEL,
  COMMON_UNSAVED_LEAVE_CONTENT,
  COMMON_UNSAVED_LEAVE_OK,
  COMMON_UNSAVED_LEAVE_TITLE
} from '@config/i18n-identifier/common/common';
import { I } from '@config/ioc-identifiter';

/**
 * Admin 脏表单离开拦截：注入 DialogHandler + 公共文案。
 *
 * @param isDirty - 是否有未保存草稿
 * @param onDiscard - 用户确认离开后丢弃草稿
 * @param watchRootSelector - 可选，限定监听脏的根节点
 * @returns guardedExit，供页内「返回」按钮使用
 */
export function useAdminUnsavedNavigationGuard(
  isDirty: boolean,
  onDiscard: () => void,
  watchRootSelector?: string
): () => void {
  const dialogHandler = useIOC(I.DialogHandler);
  const t = useWarnTranslations();

  const onExit = useCallback((): void => {
    onDiscard();
  }, [onDiscard]);

  return useNavigationGuard({
    isDirty,
    copy: {
      title: t(COMMON_UNSAVED_LEAVE_TITLE),
      content: t(COMMON_UNSAVED_LEAVE_CONTENT),
      okText: t(COMMON_UNSAVED_LEAVE_OK),
      cancelText: t(COMMON_CANCEL)
    },
    onExit,
    dialogHandler,
    watchRootSelector
  });
}
