import { Drawer, Grid } from 'antd';
import { useEffect, useState } from 'react';
import { useStore } from '@/uikit/hook/useStore';
import { type AdminTableEventInterface } from './AdminTableEventInterface';
import { eventSelectos } from './config';
import type { DrawerProps } from 'antd';

const { useBreakpoint } = Grid;

export interface AdminTablePopupProps extends DrawerProps {
  tt?: {
    create?: string;
    edit?: string;
    detail?: string;
  };
  children: React.ReactNode;
  tableEvent: AdminTableEventInterface;
}

export function AdminTablePopup(props: AdminTablePopupProps) {
  const { children, tableEvent, tt, ...drawerProps } = props;
  const openPopup = useStore(tableEvent.store, eventSelectos.openPopup);
  const action = useStore(tableEvent.store, eventSelectos.action);
  const screens = useBreakpoint();

  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');

  useEffect(() => {
    // xs: '480px'
    // sm: '576px'
    // 在小屏幕时使用 bottom placement
    setPlacement(screens.sm ? 'right' : 'bottom');
  }, [screens.sm]);

  return (
    <Drawer
      placement={placement}
      data-testid="AdminTablePopup"
      open={openPopup}
      title={tt?.[action as keyof typeof tt]}
      onClose={tableEvent.onClosePopup.bind(tableEvent)}
      {...drawerProps}
    >
      {children}
    </Drawer>
  );
}
