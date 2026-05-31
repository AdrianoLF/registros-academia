function List({ items, renderItem, empty }) {
  return (
    <ul className="bg-white rounded-xl shadow-sm divide-y divide-slate-100">
      {items.length === 0 && <li className="px-4 py-3 text-slate-400">{empty}</li>}
      {items.map(renderItem)}
    </ul>
  );
}

export default List;
