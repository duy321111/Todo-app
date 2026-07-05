import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import TodoForm from '../../components/TodoForm/TodoForm';
import TodoList from '../../components/TodoList/TodoList';
import SearchFilter from '../../components/SearchFilter';
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
      
      // Chuyển sang danh mục Chưa xong, trang 1 để xem được công việc mới lập tức
      setStatusFilter('active');
      setPage(1);
      
      // Nếu trạng thái đã là active và page đã là 1 từ trước (không kích hoạt useEffect), ta fetch thủ công
      if (statusFilter === 'active' && page === 1) {
        await fetchTodos();
      }
    } catch (err) {
      setError('Không thể thêm công việc.');
      console.error(err);
    }
  };

  const handleUpdate = async (id, updatedFields) => {
    const originalTodo = todos.find((t) => t._id === id);
    if (!originalTodo) return;

    // Cập nhật giao diện ngay lập tức (Optimistic Update)
    setTodos((prevTodos) =>
      prevTodos.map((t) => (t._id === id ? { ...t, ...updatedFields } : t))
    );

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

      // Fetch lại để đồng bộ số lượng trang và phần tử từ DB
      await fetchTodos();
    } catch (err) {
      // Hoàn tác (rollback) nếu API gặp lỗi
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t._id === id ? originalTodo : t))
      );
      setError('Không thể cập nhật công việc.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const backupTodo = todos.find((t) => t._id === id);
    const backupIndex = todos.findIndex((t) => t._id === id);

    // Xóa khỏi giao diện ngay lập tức (Optimistic Update)
    setTodos((prevTodos) => prevTodos.filter((t) => t._id !== id));

    try {
      await api.delete(`/todos/${id}`);
      
      // Fetch lại để cập nhật danh sách và phân trang
      await fetchTodos();
    } catch (err) {
      // Hoàn tác (rollback) nếu API gặp lỗi
      if (backupTodo) {
        setTodos((prevTodos) => {
          const list = [...prevTodos];
          list.splice(backupIndex, 0, backupTodo);
          return list;
        });
      }
      setError('Không thể xóa công việc.');
      console.error(err);
    }
  };

  return (
    <main className="todo-page">
      <div className="todo-shell">
        <section className="todo-card">
          <div className="todo-card__body">
            <div className="todo-header">
              <p className="todo-kicker">
                To-Do List
              </p>
              <h1 className="todo-title">Danh sách công việc</h1>
              <p className="todo-note">
                Tổng số: {totalTodos} công việc phù hợp bộ lọc
              </p>
            </div>

            <TodoForm
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              onSubmit={handleAddTodo}
            />

            <SearchFilter
              search={search}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              sortOption={sortOption}
              onSortOptionChange={handleSortOptionChange}
            />

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
      </div>
    </main>
  );
}

export default TodoPage;
