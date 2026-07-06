import { useState } from 'react';
import './TodoForm.css';

function TodoForm({ 
  title, 
  onTitleChange, 
  description, 
  onDescriptionChange, 
  onSubmit, 
  isSubmitDisabled, 
  isTitleTooLong, 
  isDescTooLong 
}) {
  const [isTouched, setIsTouched] = useState(false);

  const handleSubmit = (event) => {
    onSubmit(event);
    setIsTouched(false);
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="todo-form__inputs">
        <div className="todo-input-group">
          <input
            type="text"
            className={`todo-form__input todo-form__input--title ${(isTitleTooLong || (isTouched && !title.trim())) ? 'input-error' : ''}`}
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value);
              setIsTouched(true);
            }}
            onBlur={() => setIsTouched(true)}
            placeholder="Nhập tiêu đề công việc..."
            required
          />
          <div className="todo-input-helper">
            {isTitleTooLong ? (
              <span className="todo-error-hint">Tiêu đề không được vượt quá 100 ký tự</span>
            ) : (isTouched && !title.trim()) ? (
              <span className="todo-error-hint">Vui lòng nhập tiêu đề công việc</span>
            ) : (
              <span />
            )}
            <span className={`todo-char-count ${isTitleTooLong ? 'too-long' : ''}`}>
              {title.length}/100
            </span>
          </div>
        </div>
        
        <div className="todo-input-group">
          <input
            type="text"
            className={`todo-form__input todo-form__input--desc ${isDescTooLong ? 'input-error' : ''}`}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Nhập mô tả chi tiết..."
          />
          <div className="todo-input-helper">
            {isDescTooLong ? (
              <span className="todo-error-hint">Mô tả không được vượt quá 1000 ký tự</span>
            ) : (
              <span />
            )}
            <span className={`todo-char-count ${isDescTooLong ? 'too-long' : ''}`}>
              {description.length}/1000
            </span>
          </div>
        </div>
      </div>
      <button type="submit" className="todo-form__button" disabled={isSubmitDisabled}>
        Thêm
      </button>
    </form>
  );
}

export default TodoForm;
