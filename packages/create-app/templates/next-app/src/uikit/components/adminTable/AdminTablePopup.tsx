import { Drawer, Grid } from 'antd';
import { useEffect, useState } from 'react';
import type { DrawerProps } from 'antd';

const { useBreakpoint } = Grid;

export interface AdminTablePopupProps extends DrawerProps {
  children: React.ReactNode;
}

export function AdminTablePopup(props: AdminTablePopupProps) {
  const { children, ...drawerProps } = props;
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
      {...drawerProps}
    >
      {children}
    </Drawer>
  );
}
