'use client';

import { Button } from 'antd';
import { useIOC } from '@/uikit/hook/useIOC';
import { useStore } from '@/uikit/hook/useStore';
import { I } from '@config/ioc-identifiter';

export function ZustandCounterCard() {
  const counterService = useIOC(I.ZustandCounterServiceInterface);
  const count = useStore(counterService.getUIStore(), (s) => s.count);

  return (
    <section data-testid="ZustandCounterCard" className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl border border-c-border bg-secondary p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-secondary-text">
                Zustand adapter demo
              </div>
              <div className="text-2xl font-semibold text-primary-text">
                {count}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => counterService.dec()}>-1</Button>
              <Button type="primary" onClick={() => counterService.inc()}>
                +1
              </Button>
              <Button onClick={() => counterService.reset()}>Reset</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
