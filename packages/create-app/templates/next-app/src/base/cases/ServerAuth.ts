import { cookies } from 'next/headers';
import { I } from '@config/IOCIdentifier';
import type { ServerAuthInterface } from '../port/ServerAuthInterface';
import type { ServerInterface } from '../port/ServerInterface';

export class ServerAuth implements ServerAuthInterface {
  constructor(protected server: ServerInterface) {}

  async hasAuth(): Promise<boolean> {
    const cookieStore = await cookies();
    const appConfig = this.server.getIOC(I.AppConfig);

    const token = cookieStore.get(appConfig.userTokenKey);

    return !!token;
  }
}
