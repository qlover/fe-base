export interface RequestInterface<Config> {
  request(config: Config): Promise<unknown>;
}
