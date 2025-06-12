import { UserService } from '@/base/services/UserService';
import { IOC } from '@/core/IOC';
import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE
} from '@config/Identifier/Auth';
import { Button } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function LogoutButton() {
  const { t } = useTranslation();

  const tTitle = t(AUTH_LOGOUT_DIALOG_TITLE);
  const tContent = t(AUTH_LOGOUT_DIALOG_CONTENT);

  const onClick = useCallback(() => {
    IOC('DialogHandler').confirm({
      title: tTitle,
      content: tContent,
      onOk: () => {
        IOC(UserService).logout();
      }
    });
  }, [tTitle, tContent]);

  return (
    <Button danger onClick={onClick}>
      {tTitle}
    </Button>
  );
}
