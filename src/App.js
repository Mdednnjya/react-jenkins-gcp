import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [name, setName] = useState('');
  const [todo, setTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/todos');
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Add new todo
  const addTodo = async () => {
    if (!name.trim() || !todo.trim()) {
      setError('Both name and todo are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/todos', {
        name: name.trim(),
        todo: todo.trim()
      });
      
      setTodos(prev => [response.data, ...prev]);
      setName('');
      setTodo('');
      setError('');
    } catch (err) {
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id) => {
    try {
      await axios.put(`/api/todos/${id}`);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, done: !todo.done } : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Jenkins Todo Demo with Redis
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && addTodo()}
              placeholder="Add new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={addTodo}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading && todos.length === 0 && (
            <p className="text-gray-500 text-center">Loading todos...</p>
          )}
          
          {todos.map(todoItem => (
            <div key={todoItem.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded bg-gray-50">
              <input
                type="checkbox"
                checked={todoItem.done}
                onChange={() => toggleTodo(todoItem.id)}
                className="w-4 h-4 text-blue-500"
              />
              <div className="flex-1">
                <div className={`font-medium ${todoItem.done ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {todoItem.name} - {todoItem.todo}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(todoItem.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todoItem.id)}
                className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {todos.length === 0 && !loading && (
          <p className="text-gray-500 text-center mt-4">
            No todos yet. Add one above!
          </p>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🚀 Deployed via Jenkins CI/CD</p>
          <p>📊 Redis Storage (2h TTL)</p>
          <p>Build: {process.env.REACT_APP_BUILD_NUMBER || 'local'}</p>
          <p>Total todos: {todos.length}</p>
        </div>
      </div>
    </div>
  );
}
