import { useSliceStore } from '@qlover/slice-store-react';
import { Drawer, Grid } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { eventSelectos } from './config';
import { useResourceTableContext } from './ResourceTableContext';
import { type ResourceTableEventInterface } from './ResourceTableEventInterface';
import type { Breakpoint, DrawerProps } from 'antd';

const { useBreakpoint } = Grid;

export type PopupPlacements = {
  [key in Breakpoint]?: DrawerProps['placement'];
};

export interface ResourceTablePopupProps extends DrawerProps {
  smPlacement?: DrawerProps['placement'];
  tt?: {
    create?: string;
    edit?: string;
    detail?: string;
  };
  children: React.ReactNode;
  tableEvent: ResourceTableEventInterface;
}

export function ResourceTablePopup(props: ResourceTablePopupProps) {
  const {
    children,
    tableEvent,
    tt,
    smPlacement,
    placement = 'right',
    ...drawerProps
  } = props;

  const openPopup = useSliceStore(tableEvent.store, eventSelectos.openPopup);
  const action = useSliceStore(tableEvent.store, eventSelectos.action);

  const screens = useBreakpoint();

  const context = useResourceTableContext();

  const _smPlacement = useMemo(
    () => smPlacement || context.smPlacement || 'bottom',
    [smPlacement, context.smPlacement]
  );

  const [_placement, setPlacement] = useState(placement);

  useEffect(() => {
    setPlacement(screens.sm ? placement : _smPlacement);
  }, [screens.sm, _smPlacement, placement]);

  return (
    <Drawer
      data-testid="AdminTablePopup"
      open={openPopup}
      title={tt?.[action as keyof typeof tt]}
      onClose={tableEvent.onClosePopup.bind(tableEvent)}
      {...drawerProps}
      placement={_placement}
    >
      {children}
    </Drawer>
  );
}
