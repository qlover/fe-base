import type { BridgeOrderBy } from './DBBridgeInterface';

export interface LocalesControllerJsonQuery {
  locale: string;
  orderBy?: BridgeOrderBy;
}

export interface LocalesControllerInterface {
  json(query: LocalesControllerJsonQuery): Promise<Record<string, string>>;
}
