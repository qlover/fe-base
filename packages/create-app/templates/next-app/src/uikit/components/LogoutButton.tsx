import { Button } from 'antd';
import { useCallback } from 'react';
import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE
} from '@config/Identifier';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useI18nInterface } from '../hook/useI18nInterface';
import { useIOC } from '../hook/useIOC';
import type { PageI18nInterface } from '@config/i18n';

export function LogoutButton() {
  const IOC = useIOC();
  const tt = useI18nInterface({
    title: AUTH_LOGOUT_DIALOG_TITLE,
    content: AUTH_LOGOUT_DIALOG_CONTENT
  } as PageI18nInterface);

  const onClick = useCallback(() => {
    IOC(IOCIdentifier.DialogHandler).confirm({
      title: tt.title,
      content: tt.content,
      onOk: () => {
        IOC(IOCIdentifier.UserServiceInterface).logout();
      }
    });
  }, [tt, IOC]);

  return (
    <Button data-testid="LogoutButton" danger onClick={onClick}>
      {tt.title}
    </Button>
  );
}
