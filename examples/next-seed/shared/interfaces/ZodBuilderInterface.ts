export interface ZodBuilderInterface<Input, Ouput> {
  readonly input: Input;

  bind(key: string, params?: Partial<Ouput>): this;

  build(key: string, params?: unknown): Ouput;
  buildAll(params?: unknown): Ouput[];
}
