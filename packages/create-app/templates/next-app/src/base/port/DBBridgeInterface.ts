export interface BridgeEvent {
  table: string;
  id?: string;
  fields?: string | string[];
  data?: unknown;
}

export interface DBBridgeInterface {
  add(event: BridgeEvent): Promise<unknown>;
  update(event: BridgeEvent): Promise<unknown>;
  delete(event: BridgeEvent): Promise<void>;
  get(event: BridgeEvent): Promise<unknown>;
}
