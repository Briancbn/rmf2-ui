import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Searchbar } from '@/horizon/components/searchbar/searchbar';

describe('Searchbar', () => {
  it('renders a search input', () => {
    render(<Searchbar />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the default placeholder', () => {
    render(<Searchbar />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders a custom placeholder', () => {
    render(<Searchbar placeholder="Find components..." />);
    expect(
      screen.getByPlaceholderText('Find components...'),
    ).toBeInTheDocument();
  });

  it('renders a search icon button', () => {
    render(<Searchbar />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Searchbar />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });
});
