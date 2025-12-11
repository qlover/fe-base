import { inject, injectable } from 'inversify';
import { NavigateBridge } from './NavigateBridge';
import type { RouterInterface, RouterPathname } from '../port/RouterInterface';
import type { UIBridgeInterface } from '@qlover/corekit-bridge';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

@injectable()
export class RouterService implements RouterInterface {
  protected locale: string = '';

  constructor(
    @inject(NavigateBridge)
    protected uiBridge: UIBridgeInterface<AppRouterInstance>
  ) {}

  goto(href: RouterPathname): void {
    this.uiBridge.getUIBridge()?.push(href as string);
  }

  gotoHome(): void {
    this.goto('/');
  }

  gotoLogin(): void {
    this.goto('/login');
  }

  replaceHome(): void {
    this.uiBridge.getUIBridge()?.replace('/');
  }

  setLocale(locale: string): void {
    this.locale = locale;
  }

  getLocale(): string {
    return this.locale;
  }
}
