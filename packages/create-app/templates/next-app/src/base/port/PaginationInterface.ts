export interface PaginationInterface<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
