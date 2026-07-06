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
  return (
    <form className="todo-form" onSubmit={onSubmit}>
      <div className="todo-form__inputs">
        <div className="todo-input-group">
          <input
            type="text"
            className={`todo-form__input todo-form__input--title ${isTitleTooLong ? 'input-error' : ''}`}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Nhập tiêu đề công việc..."
            required
          />
          <div className="todo-input-helper">
            {isTitleTooLong ? (
              <span className="todo-error-hint">Tiêu đề không được vượt quá 100 ký tự</span>
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
