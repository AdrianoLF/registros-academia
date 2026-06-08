export const PAGE_SIZE = 10;

export function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

export function paginateLocal(items, { page, limit, search }, matchFn) {
  const term = search.trim().toLowerCase();
  const filtered = term ? items.filter((item) => matchFn(item, term)) : items;
  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages,
  };
}
