import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import TodoForm from '../../components/TodoForm/TodoForm';
import TodoList from '../../components/TodoList/TodoList';
import SearchFilter from '../../components/SearchFilter/SearchFilter';
import './TodoPage.css';

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States các bộ lọc và phân trang
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTodos, setTotalTodos] = useState(0);
  // States cho việc thu gọn bộ điều khiển độc lập
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  // State quản lý việc khóa các tác vụ đang thực thi (chống spam click)
  const [updatingIds, setUpdatingIds] = useState([]);

  const fetchTodos = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');

      // Xử lý status param
      let completedParam = undefined;
      if (statusFilter === 'completed') {
        completedParam = 'true';
      } else if (statusFilter === 'active') {
        completedParam = 'false';
      }

      // Xử lý sort param
      const [sortBy, order] = sortOption.split('_');

      const response = await api.get('/todos', {
        params: {
          search: search || undefined,
          completed: completedParam,
          sortBy,
          order,
          page,
          limit,
        },
      });

      setTodos(response.data.todos);
      setTotalPages(response.data.totalPages);
      setTotalTodos(response.data.totalTodos);
    } catch (err) {
      setError('Không thể tải danh sách công việc từ backend.');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [search, statusFilter, sortOption, page, limit]);

  // Tự động load dữ liệu khi các thông số thay đổi
  useEffect(() => {
    fetchTodos(true);
  }, [fetchTodos]);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((val) => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  const handleSortOptionChange = useCallback((val) => {
    setSortOption(val);
    setPage(1);
  }, []);

  const handleAddTodo = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    try {
      await api.post('/todos', { title: trimmedTitle, description: description.trim() });
      setTitle('');
      setDescription('');

      // Tải lại danh sách tương ứng với bộ lọc đang được chọn hiện tại
      await fetchTodos();
    } catch (err) {
      setError('Không thể thêm công việc.');
      console.error(err);
    }
  };

  const handleUpdate = async (id, updatedFields) => {
    if (updatingIds.includes(id)) return;

    const originalTodo = todos.find((t) => t._id === id);
    if (!originalTodo) return;
    const backupIndex = todos.findIndex((t) => t._id === id);

    // Khóa tác vụ cho todo này
    setUpdatingIds((prev) => [...prev, id]);

    // Cập nhật giao diện ngay lập tức (Optimistic Update)
    let isRemoved = false;
    if (statusFilter === 'active' && updatedFields.completed === true) {
      isRemoved = true;
    } else if (statusFilter === 'completed' && updatedFields.completed === false) {
      isRemoved = true;
    }

    if (isRemoved) {
      setTodos((prevTodos) => prevTodos.filter((t) => t._id !== id));
    } else {
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t._id === id ? { ...t, ...updatedFields } : t))
      );
    }

    try {
      const merged = {
        title: originalTodo.title,
        description: originalTodo.description || '',
        completed: originalTodo.completed,
        ...updatedFields,
      };
      await api.put(`/todos/${id}`, {
        title: merged.title,
        description: merged.description,
        completed: merged.completed,
      });
    } catch (err) {
      // Hoàn tác (rollback) nếu API gặp lỗi
      if (isRemoved) {
        setTodos((prevTodos) => {
          const list = [...prevTodos];
          list.splice(backupIndex, 0, originalTodo);
          return list;
        });
      } else {
        setTodos((prevTodos) =>
          prevTodos.map((t) => (t._id === id ? originalTodo : t))
        );
      }
      setError('Không thể cập nhật công việc.');
      console.error(err);
    } finally {
      // Mở khóa sau khi hoàn tất
      setUpdatingIds((prev) => {
        const nextUpdating = prev.filter((uid) => uid !== id);
        // Chỉ gọi fetchTodos để đồng bộ lại dữ liệu khi tất cả các tác vụ chạy ngầm đã hoàn tất
        // Việc này ngăn chặn Race Condition (các request đè lên nhau làm giật cục giao diện)
        if (nextUpdating.length === 0) {
          setTimeout(() => fetchTodos(), 0);
        }
        return nextUpdating;
      });
    }
  };

  const handleDelete = async (id) => {
    if (updatingIds.includes(id)) return;

    // Khóa tác vụ cho todo này (hệ thống sẽ tự động mờ dòng này đi và chặn click)
    setUpdatingIds((prev) => [...prev, id]);

    try {
      await api.delete(`/todos/${id}`);
    } catch (err) {
      setError('Không thể xóa công việc.');
      console.error(err);
    } finally {
      // Mở khóa và tải lại danh sách nếu là tác vụ cuối cùng hoàn tất
      setUpdatingIds((prev) => {
        const nextUpdating = prev.filter((uid) => uid !== id);
        if (nextUpdating.length === 0) {
          setTimeout(() => fetchTodos(), 0);
        }
        return nextUpdating;
      });
    }
  };

  const isTitleTooLong = title.length > 100;
  const isDescTooLong = description.length > 1000;
  const isSubmitDisabled = isTitleTooLong || isDescTooLong || !title.trim();

  const startTodoIndex = totalTodos > 0 ? (page - 1) * limit + 1 : 0;
  const endTodoIndex = Math.min(page * limit, totalTodos);

  return (
    <main className="todo-page">
      <div className="todo-shell">
        <section className="todo-card">
          <div className="todo-card__body">
            <div className="todo-header">
              <p className="todo-kicker">
                To-Do List
              </p>
            </div>

            <div className="todo-collapse-toggle">
              <button
                type="button"
                className="collapse-toggle-btn"
                onClick={() => setIsFormExpanded(!isFormExpanded)}
                aria-expanded={isFormExpanded}
              >
                <span>{isFormExpanded ? 'Ẩn Form Thêm' : 'Hiển thị Form Thêm'}</span>
                <svg
                  className={`collapse-arrow ${isFormExpanded ? 'expanded' : ''}`}
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <div className={`todo-collapsible-controls ${isFormExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="todo-collapsible-content">
                <TodoForm
                  title={title}
                  onTitleChange={setTitle}
                  description={description}
                  onDescriptionChange={setDescription}
                  onSubmit={handleAddTodo}
                  isSubmitDisabled={isSubmitDisabled}
                  isTitleTooLong={isTitleTooLong}
                  isDescTooLong={isDescTooLong}
                />
              </div>
            </div>

            <div className="todo-collapse-toggle">
              {(statusFilter !== 'all' || search.trim()) && (
                <div className="active-filters-badges">
                  <span className="filters-label">Đang lọc:</span>

                  {statusFilter !== 'all' && (
                    <span className="filter-badge">
                      <span>{statusFilter === 'active' ? 'Chưa xong' : 'Đã xong'}</span>
                      <button
                        type="button"
                        className="remove-badge-btn"
                        onClick={() => setStatusFilter('all')}
                        title="Xóa bộ lọc trạng thái"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </span>
                  )}

                  {search.trim() && (
                    <span className="filter-badge">
                      <span>Từ khóa: "{search}"</span>
                      <button
                        type="button"
                        className="remove-badge-btn"
                        onClick={() => setSearch('')}
                        title="Xóa bộ lọc tìm kiếm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </span>
                  )}

                  {statusFilter !== 'all' && search.trim() && (
                    <button
                      type="button"
                      className="clear-all-badges-btn"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearch('');
                      }}
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                className="collapse-toggle-btn"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                aria-expanded={isFiltersExpanded}
              >
                <span>{isFiltersExpanded ? 'Ẩn Bộ Lọc & Tìm Kiếm' : 'Hiển thị Bộ Lọc & Tìm Kiếm'}</span>
                <svg
                  className={`collapse-arrow ${isFiltersExpanded ? 'expanded' : ''}`}
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <div className={`todo-collapsible-controls ${isFiltersExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="todo-collapsible-content">
                <SearchFilter
                  search={search}
                  onSearchChange={handleSearchChange}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                  sortOption={sortOption}
                  onSortOptionChange={handleSortOptionChange}
                />
              </div>
            </div>

            {loading && (
              <div className="todo-state todo-state--loading">
                Đang tải...
              </div>
            )}

            {error && (
              <div className="todo-state todo-state--error">{error}</div>
            )}

            {!loading && !error && (
              <div className="todo-content-area">
                <TodoList
                  todos={todos}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  updatingIds={updatingIds}
                  page={page}
                  limit={limit}
                />

                <div className="todo-footer-controls">
                  <div className="todo-limit-selector">
                    <label htmlFor="limit-select">Hiển thị:</label>
                    <select
                      id="limit-select"
                      className="limit-dropdown"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      <option value={5}>5 công việc</option>
                      <option value={10}>10 công việc</option>
                      <option value={20}>20 công việc</option>
                    </select>
                    {totalTodos > 0 && (
                      <span className="todo-showing-text">
                        ({startTodoIndex} - {endTodoIndex} trong số {totalTodos} công việc)
                      </span>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="todo-pagination">
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        title="Trang đầu"
                      >
                        «
                      </button>
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        title="Trang trước"
                      >
                        ‹
                      </button>
                      <span className="pagination-text">
                        Trang {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                        title="Trang sau"
                      >
                        ›
                      </button>
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        title="Trang cuối"
                      >
                        »
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="todo-footer">
          <p className="todo-footer__text">
            Created with ❤️ by <span className="todo-footer__name">Duy</span>
          </p>
          <div className="todo-footer__links">
            <a
              href="mailto:duy321111@gmail.com"
              className="todo-footer__link"
              target="_blank"
              rel="noopener noreferrer"
              title="Email me"
            >
              <svg className="link-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              duy321111@gmail.com
            </a>
            <span className="todo-footer__divider">|</span>
            <a
              href="https://github.com/duy321111"
              className="todo-footer__link"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Profile"
            >
              <svg className="link-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default TodoPage;
