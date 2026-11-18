import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Food Paradise app and Ammu chatbot launcher', () => {
  render(<App />);
  const titleElement = screen.getByText(/Food Paradise/i);
  expect(titleElement).toBeInTheDocument();

  const ammuElement = screen.getByLabelText(/Open Ammu Foodie Chatbot/i);
  expect(ammuElement).toBeInTheDocument();
});
