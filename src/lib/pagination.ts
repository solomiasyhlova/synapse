export interface PaginatedResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export function paginationSkip(page: number, perPage: number): number {
  return (Math.max(page, 1) - 1) * perPage;
}

export function toPaginatedResult<T>(
  items: T[],
  totalCount: number,
  page: number,
  perPage: number,
): PaginatedResult<T> {
  return {
    items,
    page: Math.max(page, 1),
    totalPages: Math.max(Math.ceil(totalCount / perPage), 1),
    totalCount,
  };
}
