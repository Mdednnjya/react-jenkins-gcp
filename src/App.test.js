import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Jenkins Todo Demo with Redis/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders name input field', () => {
  render(<App />);
  const nameInput = screen.getByPlaceholderText(/Your name.../i);
  expect(nameInput).toBeInTheDocument();
});

test('renders todo input field', () => {
  render(<App />);
  const todoInput = screen.getByPlaceholderText(/Add new todo.../i);
  expect(todoInput).toBeInTheDocument();
});

test('renders add button', () => {
  render(<App />);
  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeInTheDocument();
});

test('shows build information', () => {
  render(<App />);
  expect(screen.getByText(/Build:/i)).toBeInTheDocument();
  expect(screen.getByText(/Total todos:/i)).toBeInTheDocument();
});
