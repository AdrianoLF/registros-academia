import List from './List';
import SearchInput from './SearchInput';
import PageNav from './PageNav.jsx';
import LoadingPanel from './LoadingPanel';

function PaginatedList({
  items,
  total,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  loading,
  empty,
  renderItem,
  searchPlaceholder = 'Buscar...',
  showSearch = true,
}) {
  return (
    <div className="space-y-3">
      {showSearch && (
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}
      {loading ? (
        <LoadingPanel />
      ) : (
        <>
          <List items={items} empty={empty} renderItem={renderItem} />
          <PageNav
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

export default PaginatedList;
