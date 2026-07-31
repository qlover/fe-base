'use client';

import { clsx } from 'clsx';
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  title: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  /** Extra class for the tooltip bubble */
  overlayClassName?: string;
}

function computeStyle(
  trigger: DOMRect,
  tip: DOMRect,
  placement: TooltipPlacement
): CSSProperties {
  const gap = 8;
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = trigger.bottom + gap;
      left = trigger.left + trigger.width / 2 - tip.width / 2;
      break;
    case 'left':
      top = trigger.top + trigger.height / 2 - tip.height / 2;
      left = trigger.left - tip.width - gap;
      break;
    case 'right':
      top = trigger.top + trigger.height / 2 - tip.height / 2;
      left = trigger.right + gap;
      break;
    case 'top':
    default:
      top = trigger.top - tip.height - gap;
      left = trigger.left + trigger.width / 2 - tip.width / 2;
      break;
  }

  const pad = 8;
  left = Math.min(Math.max(pad, left), window.innerWidth - tip.width - pad);
  top = Math.min(Math.max(pad, top), window.innerHeight - tip.height - pad);

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 1000
  };
}

/**
 * Lightweight tooltip (antd-free).
 * Renders via portal so sticky headers / overflow cannot clip it.
 */
export function Tooltip({
  title,
  children,
  placement = 'top',
  className,
  overlayClassName
}: TooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    visibility: 'hidden'
  });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current?.getBoundingClientRect();
    const tip = tipRef.current?.getBoundingClientRect();
    if (!trigger || !tip || tip.width === 0) return;
    setStyle({
      ...computeStyle(trigger, tip, placement),
      visibility: 'visible'
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) {
      setStyle((prev) => ({ ...prev, visibility: 'hidden' }));
      return;
    }
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, updatePosition]);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  if (title == null || title === false || title === '') {
    return <>{children}</>;
  }

  return (
    <span
      ref={triggerRef}
      data-testid="Tooltip"
      className={clsx('relative inline-flex max-w-full', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {mounted &&
        createPortal(
          <span
            ref={tipRef}
            id={tooltipId}
            role="tooltip"
            aria-hidden={!open}
            style={style}
            className={clsx(
              'pointer-events-none whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-lg',
              'bg-primary-text text-primary border border-primary-border/30',
              overlayClassName
            )}
          >
            {title}
          </span>,
          document.body
        )}
    </span>
  );
}
