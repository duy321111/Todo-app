import './TodoForm.css';

function TodoForm({ title, onTitleChange, description, onDescriptionChange, onSubmit }) {
  return (
    <form className="todo-form" onSubmit={onSubmit}>
      <div className="todo-form__inputs">
        <input
          type="text"
          className="todo-form__input todo-form__input--title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Nhập tiêu đề công việc..."
          required
        />
        <input
          type="text"
          className="todo-form__input todo-form__input--desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Nhập mô tả chi tiết..."
        />
      </div>
      <button type="submit" className="todo-form__button">
        Thêm
      </button>
    </form>
  );
}

export default TodoForm;
