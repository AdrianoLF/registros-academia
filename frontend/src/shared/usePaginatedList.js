import { useCallback, useEffect, useState } from 'react';
import { PAGE_SIZE } from './pageQuery';

const DEBOUNCE_MS = 300;

export function usePaginatedList(loadFn, deps = []) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [extra, setExtra] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadFn({ page, search, limit: PAGE_SIZE });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      const { items: _items, total: _total, totalPages: _totalPages, page: _page, limit: _limit, ...rest } = result;
      setExtra(rest);
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }, [loadFn, page, search, ...deps]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return {
    items,
    total,
    page,
    totalPages,
    limit: PAGE_SIZE,
    searchInput,
    setSearchInput,
    setPage,
    loading,
    reload,
    extra,
  };
}
