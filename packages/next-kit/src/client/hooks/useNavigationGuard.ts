'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { DialogHandler } from '../DialogHandler';
import {
  isGuardHistoryState,
  resolveGuardedAnchor,
  withGuardHistoryState
} from './NavigationGuardUtil';

export type NavigationGuardCopyType = {
  readonly title: string;
  readonly content: string;
  readonly okText: string;
  readonly cancelText: string;
};

export const NAVIGATION_GUARD_DECISION = {
  leave: 'leave',
  stay: 'stay',
  save: 'save'
} as const;

export type NavigationGuardDecisionType =
  (typeof NAVIGATION_GUARD_DECISION)[keyof typeof NAVIGATION_GUARD_DECISION];

export type NavigationGuardOptionsType = {
  /** 自定义离开确认；未传则走 DialogHandler 双按钮。 */
  readonly prompt?: () => Promise<NavigationGuardDecisionType>;
  /** `save` 决策时先保存，成功才离开。 */
  readonly onSaveAndExit?: () => Promise<boolean>;
};

export type UseNavigationGuardParamsType = {
  readonly isDirty: boolean;
  readonly copy: NavigationGuardCopyType;
  readonly onExit: () => void;
  /** 应用注入的 DialogHandler（kit 不绑 IOC）。 */
  readonly dialogHandler: DialogHandler;
  /** 限定在该根节点内的 input/change 立即记脏。 */
  readonly watchRootSelector?: string;
  readonly options?: NavigationGuardOptionsType;
};

/**
 * 拦截离开：刷新/关页、后退、站内 Link，以及页面内「返回」按钮。
 *
 * @returns guardedExit — 页面内按钮的点击处理函数
 */
export function useNavigationGuard(
  params: UseNavigationGuardParamsType
): () => void {
  const {
    isDirty,
    copy,
    onExit,
    dialogHandler,
    watchRootSelector,
    options
  } = params;

  const isDirtyRef = useRef(isDirty);
  const pendingDirtyRef = useRef(false);
  const copyRef = useRef(copy);
  const onExitRef = useRef(onExit);
  const optionsRef = useRef(options);
  const dialogHandlerRef = useRef(dialogHandler);
  const sentinelPushedRef = useRef(false);
  const promptOpenRef = useRef(false);

  isDirtyRef.current = isDirty;
  copyRef.current = copy;
  onExitRef.current = onExit;
  optionsRef.current = options;
  dialogHandlerRef.current = dialogHandler;
  if (!isDirty) {
    pendingDirtyRef.current = false;
  }

  const isBlocked = useCallback((): boolean => {
    return isDirtyRef.current || pendingDirtyRef.current;
  }, []);

  const allowLeave = useCallback((): void => {
    pendingDirtyRef.current = false;
    isDirtyRef.current = false;
  }, []);

  const promptLeave = useCallback((): Promise<boolean> => {
    if (!isBlocked()) {
      return Promise.resolve(true);
    }
    if (promptOpenRef.current) {
      return Promise.resolve(false);
    }
    promptOpenRef.current = true;
    const finish = (ok: boolean): boolean => {
      promptOpenRef.current = false;
      return ok;
    };
    const customPrompt = optionsRef.current?.prompt;
    if (customPrompt != null) {
      return customPrompt()
        .then(async (decision) => {
          if (decision === NAVIGATION_GUARD_DECISION.stay) {
            return finish(false);
          }
          if (decision === NAVIGATION_GUARD_DECISION.leave) {
            return finish(true);
          }
          const saved = await optionsRef.current?.onSaveAndExit?.();
          return finish(saved === true);
        })
        .catch(() => finish(false));
    }
    const texts = copyRef.current;
    return new Promise((resolve) => {
      dialogHandlerRef.current.confirm({
        title: texts.title,
        content: texts.content,
        okText: texts.okText,
        cancelText: texts.cancelText,
        okType: 'danger',
        onOk: () => {
          resolve(finish(true));
        },
        onCancel: () => {
          resolve(finish(false));
        }
      });
    });
  }, [isBlocked]);

  useEffect(() => {
    const markPendingDirty = (event: Event): void => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (watchRootSelector != null && watchRootSelector.length > 0) {
        if (target.closest(watchRootSelector) == null) {
          return;
        }
      }
      pendingDirtyRef.current = true;
    };

    const beforeUnloadHandler = (event: BeforeUnloadEvent): void => {
      if (!isBlocked()) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    };

    const popStateHandler = (event: PopStateEvent): void => {
      if (!isBlocked()) {
        return;
      }
      event.stopImmediatePropagation();
      if (promptOpenRef.current) {
        window.history.pushState(
          withGuardHistoryState(window.history.state),
          '',
          window.location.href
        );
        sentinelPushedRef.current = true;
        return;
      }
      void promptLeave().then((ok) => {
        if (!ok) {
          window.history.pushState(
            withGuardHistoryState(window.history.state),
            '',
            window.location.href
          );
          sentinelPushedRef.current = true;
          return;
        }
        allowLeave();
        window.history.back();
      });
    };

    const clickHandler = (event: MouseEvent): void => {
      if (!isBlocked()) {
        return;
      }
      const anchor = resolveGuardedAnchor(event, window.location.href);
      if (anchor == null) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      void promptLeave().then((ok) => {
        if (!ok) {
          return;
        }
        allowLeave();
        window.location.assign(anchor.href);
      });
    };

    document.addEventListener('input', markPendingDirty, true);
    document.addEventListener('change', markPendingDirty, true);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    window.addEventListener('popstate', popStateHandler, true);
    document.addEventListener('click', clickHandler, true);

    return (): void => {
      document.removeEventListener('input', markPendingDirty, true);
      document.removeEventListener('change', markPendingDirty, true);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('popstate', popStateHandler, true);
      document.removeEventListener('click', clickHandler, true);
    };
  }, [allowLeave, isBlocked, promptLeave, watchRootSelector]);

  useEffect(() => {
    if (!isDirty) {
      sentinelPushedRef.current = false;
      return;
    }
    if (sentinelPushedRef.current) {
      return;
    }
    if (isGuardHistoryState(window.history.state)) {
      sentinelPushedRef.current = true;
      return;
    }
    window.history.pushState(
      withGuardHistoryState(window.history.state),
      '',
      window.location.href
    );
    sentinelPushedRef.current = true;
  }, [isDirty]);

  return useCallback((): void => {
    void promptLeave().then((ok) => {
      if (!ok) {
        return;
      }
      allowLeave();
      onExitRef.current();
    });
  }, [allowLeave, promptLeave]);
}
