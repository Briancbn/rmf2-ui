import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from './utils';
import { Card } from '@/horizon/components/card/card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders as a div', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card').tagName).toBe('DIV');
  });

  it('forwards additional chakra props', () => {
    render(<Card data-testid="card" p="40px" w="300px" />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <span>First</span>
        <span>Second</span>
      </Card>,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
