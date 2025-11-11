import {
  AUTH_LOGOUT_DIALOG_CONTENT,
  AUTH_LOGOUT_DIALOG_TITLE
} from '@config/Identifier/common/common';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { Button } from 'antd';
import { useCallback } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useIOC } from '../hooks/useIOC';

export function LogoutButton() {
  const { t } = useAppTranslation();
  const dialogHandler = useIOC(IOCIdentifier.DialogHandler);
  const userService = useIOC(IOCIdentifier.UserServiceInterface);

  const tTitle = t(AUTH_LOGOUT_DIALOG_TITLE);
  const tContent = t(AUTH_LOGOUT_DIALOG_CONTENT);

  const onClick = useCallback(() => {
    dialogHandler.confirm({
      title: tTitle,
      okButtonProps: {
        'data-testid': 'LogoutButton-OkButton'
      },
      cancelButtonProps: {
        'data-testid': 'LogoutButton-CancelButton'
      },
      content: tContent,
      onOk: () => {
        userService.logout();
      }
    });
  }, [tTitle, tContent]);

  return (
    <Button data-testid="LogoutButton" danger onClick={onClick}>
      {tTitle}
    </Button>
  );
}
