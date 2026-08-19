'use client';

import { clsx } from 'clsx';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';

export type DropdownItem = {
  key: string;
  label: ReactNode;
  disabled?: boolean;
};

export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

export interface DropdownProps {
  items: DropdownItem[];
  children: ReactElement;
  selectedKeys?: string[];
  onSelect?: (key: string) => void;
  placement?: DropdownPlacement;
  /**
   * Mobile presentation:
   * - `sheet` (default): bottom sheet + backdrop
   * - `menu`: same floating menu as desktop
   */
  mobileMode?: 'sheet' | 'menu';
  /** 菜单最小宽度（px），默认与触发元素等宽 */
  menuMinWidth?: number;
  className?: string;
  menuClassName?: string;
  'data-testid'?: string;
  closeLabel?: string;
}

const MOBILE_MQ = '(max-width: 767px)';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    setIsMobile(mq.matches);
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

/**
 * Responsive dropdown (antd-free).
 * Desktop: floating menu near the trigger.
 * Mobile (`mobileMode="sheet"`): bottom sheet with dimmed backdrop.
 */
export function Dropdown({
  items,
  children,
  selectedKeys = [],
  onSelect,
  placement = 'bottom-end',
  mobileMode = 'sheet',
  menuMinWidth,
  className,
  menuClassName,
  'data-testid': dataTestId = 'Dropdown',
  closeLabel = 'Close'
}: DropdownProps) {
  const listId = useId();
  const triggerWrapRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Trigger rect captured at click time — always available, no timing issues.
  const triggerRectRef = useRef<DOMRect | null>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const isMobile = useIsMobile();
  const useSheet = isMobile && mobileMode === 'sheet';

  useEffect(() => {
    setMounted(true);
  }, []);

  const computeStyle = useCallback(
    (triggerRect: DOMRect, menuWidth: number, menuHeight: number): CSSProperties => {
      const gap = 8;
      const pad = 8;
      const preferBottom = placement.startsWith('bottom');
      const preferEnd = placement.endsWith('end');

      let top = preferBottom
        ? triggerRect.bottom + gap
        : triggerRect.top - menuHeight - gap;
      let left = preferEnd
        ? triggerRect.right - menuWidth
        : triggerRect.left;

      left = Math.min(Math.max(pad, left), window.innerWidth - menuWidth - pad);
      top = Math.min(Math.max(pad, top), window.innerHeight - menuHeight - pad);

      const minWidth = menuMinWidth ?? triggerRect.width;

      return {
        position: 'fixed',
        top,
        left,
        zIndex: 1100,
        minWidth
      };
    },
    [placement, menuMinWidth]
  );

  // After portal mounts, read menu dimensions and finalize position.
  useLayoutEffect(() => {
    if (!open || useSheet) return;
    const triggerRect = triggerRectRef.current;
    const menuEl = menuRef.current;
    if (!triggerRect || !menuEl) return;
    const { width, height } = menuEl.getBoundingClientRect();
    setMenuStyle(computeStyle(triggerRect, width, height));
  }, [open, useSheet, computeStyle]);

  const close = useCallback(() => setOpen(false), []);

  const openDropdown = useCallback(() => {
    const rect = triggerWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    triggerRectRef.current = rect;
    // Show immediately at approximate position using trigger rect only.
    // useLayoutEffect will refine with real menu dimensions after mount.
    setMenuStyle(computeStyle(rect, 160, 0));
    setOpen(true);
  }, [computeStyle]);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      openDropdown();
    }
  }, [open, close, openDropdown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerWrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || !useSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, useSheet]);

  // Reposition on scroll/resize.
  useEffect(() => {
    if (!open || useSheet) return;
    const reposition = () => {
      const triggerRect = triggerWrapRef.current?.getBoundingClientRect();
      const menuEl = menuRef.current;
      if (!triggerRect || !menuEl) return;
      const { width, height } = menuEl.getBoundingClientRect();
      setMenuStyle(computeStyle(triggerRect, width, height));
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, useSheet, computeStyle]);

  const handleSelect = useCallback(
    (key: string, disabled?: boolean) => {
      if (disabled) return;
      onSelect?.(key);
      close();
    },
    [onSelect, close]
  );

  const child = Children.only(children);
  if (!isValidElement(child)) return null;

  const triggerEl = cloneElement(
    child as ReactElement<Record<string, unknown>>,
    {
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': open ? listId : undefined,
      onClick: (e: MouseEvent) => {
        const props = child.props as {
          onClick?: (ev: MouseEvent) => void;
          disabled?: boolean;
        };
        props.onClick?.(e);
        if (e.defaultPrevented || props.disabled) return;
        e.preventDefault();
        toggle();
      },
      onKeyDown: (e: KeyboardEvent) => {
        const props = child.props as {
          onKeyDown?: (ev: KeyboardEvent) => void;
          disabled?: boolean;
        };
        props.onKeyDown?.(e);
        if (e.defaultPrevented || props.disabled) return;
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDropdown();
        }
      }
    }
  );

  const selectedSet = new Set(selectedKeys);

  const menuList = (
    <ul
      id={listId}
      role="menu"
      className={clsx(
        'py-1',
        useSheet ? 'max-h-[70vh] overflow-y-auto' : 'max-h-80 overflow-y-auto'
      )}
    >
      {items.map((item) => {
        const selected = selectedSet.has(item.key);
        return (
          <li data-testid="DropdownMenuItem" key={item.key} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              data-selected={selected || undefined}
              className={clsx(
                'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                useSheet && 'min-h-11 px-4 py-3 text-base',
                item.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-elevated cursor-pointer',
                selected
                  ? 'bg-brand/10 text-brand font-medium'
                  : 'text-primary-text'
              )}
              onClick={() => handleSelect(item.key, item.disabled)}
            >
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const floatingMenu =
    open &&
    mounted &&
    createPortal(
      useSheet ? (
        <div
          data-testid={`${dataTestId}Sheet`}
          className="fixed inset-0 z-1100 flex flex-col justify-end"
        >
          <button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-black/40 border-0 cursor-pointer"
            onClick={close}
          />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            className={clsx(
              'relative z-1 rounded-t-2xl border border-primary-border bg-primary shadow-xl',
              'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
              menuClassName
            )}
          >
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1 w-10 rounded-full bg-primary-border" />
            </div>
            {menuList}
          </div>
        </div>
      ) : (
        <div
          ref={menuRef}
          data-testid={`${dataTestId}Menu`}
          style={menuStyle}
          className={clsx(
            'rounded-lg border border-primary-border bg-primary shadow-lg overflow-hidden',
            menuClassName
          )}
        >
          {menuList}
        </div>
      ),
      document.body
    );

  return (
    <span
      ref={triggerWrapRef}
      data-testid={dataTestId}
      className={clsx('relative inline-flex max-w-full', className)}
    >
      {triggerEl}
      {floatingMenu}
    </span>
  );
}
