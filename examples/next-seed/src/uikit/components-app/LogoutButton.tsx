'use client';

import { LogoutOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useCallback } from 'react';
import {
  COMMON_LOGOUT_DIALOG_CONTENT,
  COMMON_LOGOUT_DIALOG_TITLE
} from '@config/i18n-identifier/common/common';
import { I } from '@config/ioc-identifiter';
import { useI18nMapping } from '../hook/useI18nMapping';
import { useIOC } from '../hook/useIOC';

export function LogoutButton() {
  const dialogHandler = useIOC(I.DialogHandler);
  const userService = useIOC(I.UserServiceInterface);
  const routerService = useIOC(I.RouterServiceInterface);

  const tt = useI18nMapping({
    title: COMMON_LOGOUT_DIALOG_TITLE,
    content: COMMON_LOGOUT_DIALOG_CONTENT
  });

  const onClick = useCallback(() => {
    dialogHandler.confirm({
      title: tt.title,
      content: tt.content,
      onOk: async () => {
        await userService.logout();
        routerService.gotoLogin();
      }
    });
  }, [tt, dialogHandler, userService, routerService]);

  return (
    <Tooltip data-testid="LogoutIcon" title={tt.title} placement="right">
      <span
        className="text-primary-text hover:text-red-500 cursor-pointer text-lg transition-colors"
        onClick={onClick}
      >
        <LogoutOutlined />
      </span>
    </Tooltip>
  );
}
