import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE
} from '@config/Identifier/common/common';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Button } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useIOC } from '../hooks/useIOC';

export default function LogoutButton() {
  const { t } = useTranslation();
  const dialogHandler = useIOC(IOCIdentifier.DialogHandler);
  const userService = useIOC(IOCIdentifier.UserServiceInterface);

  const tTitle = t(AUTH_LOGOUT_DIALOG_TITLE);
  const tContent = t(AUTH_LOGOUT_DIALOG_CONTENT);

  const onClick = useCallback(() => {
    dialogHandler.confirm({
      title: tTitle,
      content: tContent,
      onOk: () => {
        userService.logout();
      }
    });
  }, [tTitle, tContent]);

  return (
    <Button danger onClick={onClick}>
      {tTitle}
    </Button>
  );
}
