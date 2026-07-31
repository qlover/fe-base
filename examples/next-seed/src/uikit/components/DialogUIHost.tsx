'use client';

import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { DialogUIHost as KitDialogUIHost } from '@qlover/next-kit/client';
import { I } from '@config/ioc-identifiter';
import { useIOC } from '../hook/useIOC';

/**
 * Bridges imperative DialogHandler confirm/toast to React UI.
 */
export function DialogUIHost() {
  const dialogHandler = useIOC(I.DialogHandler);

  return (
    <KitDialogUIHost
      dialogHandler={dialogHandler}
      pendingIcon={<ArrowPathIcon className="h-4 w-4 animate-spin" />}
      warningIcon={
        <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
      }
      closeIcon={<XMarkIcon className="h-5 w-5" />}
    />
  );
}
