import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Text } from '../src/commponents/Text';

describe('Text Component', () => {
  test('renders the text prop', () => {
    render(<Text text="Hello, World!" />);
    const textElement = screen.getByText(/Hello, World!/i);
    expect(textElement).toBeInTheDocument();
  });
});
