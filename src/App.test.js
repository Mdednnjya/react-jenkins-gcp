import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock data
const mockTodos = [
  {
    id: '1',
    name: 'John',
    todo: 'Learn React',
    done: false,
    createdAt: '2024-01-01T10:00:00.000Z'
  },
  {
    id: '2',
    name: 'Jane',
    todo: 'Build CI/CD pipeline',
    done: true,
    createdAt: '2024-01-01T11:00:00.000Z'
  }
];

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders todo app title', () => {
  mockedAxios.get.mockResolvedValue({ data: [] });
  render(<App />);
  expect(screen.getByText(/Jenkins Todo Demo with Redis/i)).toBeInTheDocument();
});

test('displays loading state initially', () => {
  mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
  render(<App />);
  expect(screen.getByText(/Loading todos.../i)).toBeInTheDocument();
});

test('fetches and displays todos on mount', async () => {
  mockedAxios.get.mockResolvedValue({ data: mockTodos });
  
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByText('John - Learn React')).toBeInTheDocument();
    expect(screen.getByText('Jane - Build CI/CD pipeline')).toBeInTheDocument();
  });
  
  expect(mockedAxios.get).toHaveBeenCalledWith('/api/todos');
});

test('can add a new todo with name and task', async () => {
  mockedAxios.get.mockResolvedValue({ data: [] });
  const newTodo = {
    id: '3',
    name: 'Alice',
    todo: 'Test the app',
    done: false,
    createdAt: '2024-01-01T12:00:00.000Z'
  };
  mockedAxios.post.mockResolvedValue({ data: newTodo });
  
  render(<App />);
  
  await waitFor(() => {
    expect(screen.queryByText(/Loading todos.../i)).not.toBeInTheDocument();
  });
  
  const nameInput = screen.getByPlaceholderText(/Your name.../i);
  const todoInput = screen.getByPlaceholderText(/Add new todo.../i);
  const addButton = screen.getByRole('button', { name: /add/i });
  
  fireEvent.change(nameInput, { target: { value: 'Alice' } });
  fireEvent.change(todoInput, { target: { value: 'Test the app' } });
  fireEvent.click(addButton);
  
  expect(mockedAxios.post).toHaveBeenCalledWith('/api/todos', {
    name: 'Alice',
    todo: 'Test the app'
  });
});

test('shows error when trying to add empty todo', async () => {
  mockedAxios.get.mockResolvedValue({ data: [] });
  
  render(<App />);
  
  await waitFor(() => {
    expect(screen.queryByText(/Loading todos.../i)).not.toBeInTheDocument();
  });
  
  const addButton = screen.getByRole('button', { name: /add/i });
  fireEvent.click(addButton);
  
  expect(screen.getByText(/Both name and todo are required/i)).toBeInTheDocument();
  expect(mockedAxios.post).not.toHaveBeenCalled();
});

test('can toggle todo completion', async () => {
  mockedAxios.get.mockResolvedValue({ data: mockTodos });
  mockedAxios.put.mockResolvedValue({ data: { success: true } });
  
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByText('John - Learn React')).toBeInTheDocument();
  });
  
  const checkbox = screen.getAllByRole('checkbox')[0];
  fireEvent.click(checkbox);
  
  expect(mockedAxios.put).toHaveBeenCalledWith('/api/todos/1');
});

test('can delete todo', async () => {
  mockedAxios.get.mockResolvedValue({ data: mockTodos });
  mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByText('John - Learn React')).toBeInTheDocument();
  });
  
  const deleteButton = screen.getAllByText('Delete')[0];
  fireEvent.click(deleteButton);
  
  expect(mockedAxios.delete).toHaveBeenCalledWith('/api/todos/1');
});

test('displays todo count', async () => {
  mockedAxios.get.mockResolvedValue({ data: mockTodos });
  
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByText('Total todos: 2')).toBeInTheDocument();
  });
});

test('shows correct format for todo items', async () => {
  mockedAxios.get.mockResolvedValue({ data: mockTodos });
  
  render(<App />);
  
  await waitFor(() => {
    // Check name - todo format
    expect(screen.getByText('John - Learn React')).toBeInTheDocument();
    expect(screen.getByText('Jane - Build CI/CD pipeline')).toBeInTheDocument();
  });
});
