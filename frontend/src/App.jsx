import { Navigate, Route, Routes } from 'react-router-dom';
import TodoPage from './pages/TodoPage/TodoPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TodoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
