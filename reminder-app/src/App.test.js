import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the Hebrew login screen when signed out', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'התזכורות שלי' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'כניסה' })).toBeInTheDocument();
});
