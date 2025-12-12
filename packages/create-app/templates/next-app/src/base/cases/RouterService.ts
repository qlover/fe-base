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

  public goto(href: RouterPathname): void {
    this.uiBridge.getUIBridge()?.push(href as string);
  }

  public gotoHome(): void {
    this.goto('/');
  }

  public gotoLogin(): void {
    this.goto('/login');
  }

  public replaceHome(): void {
    this.uiBridge.getUIBridge()?.replace('/');
  }

  public setLocale(locale: string): void {
    this.locale = locale;
  }

  public getLocale(): string {
    return this.locale;
  }
}
