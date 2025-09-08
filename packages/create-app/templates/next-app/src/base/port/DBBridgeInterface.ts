export interface DBBridgeInterface {
  add(table: string, data: unknown): Promise<unknown>;
  update(table: string, id: string, data: unknown): Promise<unknown>;
  delete(table: string, id: string): Promise<void>;
  /**
   * @param table - The table to get data from
   * @param id - The id of the data to get
   * @returns The data from the table
   */
  get(table: string, id?: string): Promise<unknown>;
}
