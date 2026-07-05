import { useState } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleSave = () => {
    if (!editTitle.trim()) {
      return;
    }
    onUpdate(todo._id, { title: editTitle.trim(), description: editDescription.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="todo-row todo-row--edit">
        <div className="todo-edit-fields">
          <input
            type="text"
            className="todo-edit-input todo-edit-input--title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Tiêu đề..."
            required
          />
          <textarea
            className="todo-edit-input todo-edit-input--desc"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Mô tả..."
            rows={2}
          />
        </div>
        <div className="todo-edit-actions">
          <button type="button" className="edit-action-btn save-btn" onClick={handleSave}>
            Lưu
          </button>
          <button type="button" className="edit-action-btn cancel-btn" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-row ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-text">
        <span className="todo-text__title">{todo.title}</span>
        {todo.description && (
          <span className="todo-text__desc">{todo.description}</span>
        )}
      </div>

      <button
        type="button"
        className={`todo-status-btn ${todo.completed ? 'completed' : ''}`}
        onClick={() => onUpdate(todo._id, { completed: !todo.completed })}
        title={todo.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
      >
        <span className="status-default">
          {todo.completed ? '✓ Đã xong' : '○ Chưa xong'}
        </span>
        <span className="status-hover">
          {todo.completed ? '✕ Hủy xong' : '✓ Xong'}
        </span>
      </button>

      <div className="todo-actions">
        <button
          type="button"
          className="edit-btn"
          onClick={() => setIsEditing(true)}
          aria-label={`Sửa ${todo.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>

        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(todo._id)}
          aria-label={`Xóa ${todo.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
