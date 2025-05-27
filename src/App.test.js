import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders todo app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Jenkins Todo Demo/i);
  expect(titleElement).toBeInTheDocument();
});

test('can add a new todo', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Add new todo/i);
  const addButton = screen.getByRole('button', { name: /add/i });
  
  fireEvent.change(input, { target: { value: 'Test todo' } });
  fireEvent.click(addButton);
  
  expect(screen.getByText('Test todo')).toBeInTheDocument();
});

test('can toggle todo completion', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Add new todo/i);
  const addButton = screen.getByRole('button', { name: /add/i });
  
  fireEvent.change(input, { target: { value: 'Test todo' } });
  fireEvent.click(addButton);
  
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);
  
  expect(checkbox).toBeChecked();
});

test('app renders without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Jenkins Todo Demo/i)).toBeInTheDocument();
});
