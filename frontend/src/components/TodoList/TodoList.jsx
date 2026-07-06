import TodoItem from '../TodoItem/TodoItem';
import './TodoList.css';

function TodoList({ todos, onUpdate, onDelete }) {
  if (!todos.length) {
    return (
      <div className="todo-empty">
        Trống
      </div>
    );
  }

  return (
    <div className="todo-list">
      <div className="todo-list-header">
        <span className="col-header col-header--text">Công việc</span>
        <span className="col-header col-header--status">Trạng thái</span>
        <span className="col-header col-header--actions">Điều chỉnh</span>
      </div>
      <div className="todo-list-items">
        {todos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default TodoList;
