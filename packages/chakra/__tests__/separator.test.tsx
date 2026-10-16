import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { HSeparator, VSeparator } from '@/horizon/components/separator/separator';

describe('HSeparator', () => {
  it('renders without crashing', () => {
    const { container } = render(<HSeparator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<HSeparator />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
  });

  it('accepts additional chakra props', () => {
    render(<HSeparator data-testid="sep" bg="red.500" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });
});

describe('VSeparator', () => {
  it('renders without crashing', () => {
    const { container } = render(<VSeparator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts height prop', () => {
    render(<VSeparator data-testid="vsep" h="100px" />);
    expect(screen.getByTestId('vsep')).toBeInTheDocument();
  });
});
