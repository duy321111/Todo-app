import { useState } from 'react';
import './TodoItem.css';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

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
    const isTitleTooLong = editTitle.length > 100;
    const isDescTooLong = editDescription.length > 1000;
    const isSaveDisabled = isTitleTooLong || isDescTooLong || !editTitle.trim();

    return (
      <div className="todo-row todo-row--edit">
        <div className="todo-edit-fields">
          <div className="todo-input-group">
            <input
              type="text"
              className={`todo-edit-input todo-edit-input--title ${isTitleTooLong ? 'input-error' : ''}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Tiêu đề..."
              required
            />
            <div className="todo-input-helper">
              {isTitleTooLong ? (
                <span className="todo-error-hint">Tiêu đề không được vượt quá 100 ký tự</span>
              ) : (
                <span />
              )}
              <span className={`todo-char-count ${isTitleTooLong ? 'too-long' : ''}`}>
                {editTitle.length}/100
              </span>
            </div>
          </div>
          
          <div className="todo-input-group">
            <textarea
              className={`todo-edit-input todo-edit-input--desc ${isDescTooLong ? 'input-error' : ''}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Mô tả..."
              rows={2}
            />
            <div className="todo-input-helper">
              {isDescTooLong ? (
                <span className="todo-error-hint">Mô tả không được vượt quá 1000 ký tự</span>
              ) : (
                <span />
              )}
              <span className={`todo-char-count ${isDescTooLong ? 'too-long' : ''}`}>
                {editDescription.length}/1000
              </span>
            </div>
          </div>
        </div>
        <div className="todo-edit-actions">
          <button 
            type="button" 
            className="edit-action-btn save-btn" 
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
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
        {todo.createdAt && (
          <span className="todo-text__time">
            <svg className="time-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {formatDate(todo.createdAt)}
          </span>
        )}
      </div>

      <button
        type="button"
        className={`todo-status-btn ${todo.completed ? 'completed' : ''}`}
        onClick={() => onUpdate(todo._id, { completed: !todo.completed })}
        title={todo.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
      >
        <span>
          {todo.completed ? '✓ Đã xong' : '○ Chưa xong'}
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
