export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

export type ParsedPageQuery = {
  page: number;
  limit: number;
  search: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function parsePageQuery(query: Record<string, unknown>): ParsedPageQuery {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  let limit = Number.parseInt(String(query.limit ?? DEFAULT_PAGE_LIMIT), 10) || DEFAULT_PAGE_LIMIT;
  limit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  return { page, limit, search };
}

export function parseEnabledFilter(value: unknown): boolean | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  throw new Error('Invalid enabled filter');
}

export function skip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildPageResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PageResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
