import { useEffect, useState } from 'react';
import './SearchFilter.css';

function SearchFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOption,
  onSortOptionChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input to avoid hitting the backend on every keypress
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, onSearchChange]);

  // Sync props back to local state if changed externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="todo-search-filter">
      <div className="search-box">
        <svg
          className="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm công việc theo tiêu đề hoặc mô tả..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setLocalSearch('')}
            aria-label="Xóa tìm kiếm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-sort-group">
        <div className="status-tabs">
          <button
            type="button"
            className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('active')}
          >
            Chưa xong
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('completed')}
          >
            Đã xong
          </button>
        </div>

        <div className="sort-selector">
          <label htmlFor="sort-select" className="sort-label">Sắp xếp:</label>
          <select
            id="sort-select"
            className="sort-dropdown"
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value)}
          >
            <option value="createdAt_desc">Mới nhất</option>
            <option value="createdAt_asc">Cũ nhất</option>
            <option value="title_asc">Tiêu đề (A-Z)</option>
            <option value="title_desc">Tiêu đề (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default SearchFilter;
