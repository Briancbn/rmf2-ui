import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from './utils';
import {
  PendingRoot,
  PendingOverlay,
  PendingSpinner,
} from '@/horizon/components/pending/pending';

describe('PendingRoot', () => {
  it('renders without crashing', () => {
    const { container } = render(<PendingRoot />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<PendingRoot>Loading...</PendingRoot>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('accepts additional chakra props', () => {
    render(<PendingRoot data-testid="pending-root" />);
    expect(screen.getByTestId('pending-root')).toBeInTheDocument();
  });

  it('has displayName set', () => {
    expect(PendingRoot.displayName).toBe('Pending.Root');
  });
});

describe('PendingOverlay', () => {
  it('renders without crashing', () => {
    const { container } = render(<PendingOverlay />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts additional chakra props', () => {
    render(<PendingOverlay data-testid="pending-overlay" />);
    expect(screen.getByTestId('pending-overlay')).toBeInTheDocument();
  });

  it('has displayName set', () => {
    expect(PendingOverlay.displayName).toBe('Pending.Overlay');
  });
});

describe('PendingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<PendingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts spinner props', () => {
    render(<PendingSpinner data-testid="pending-spinner" size="md" />);
    expect(screen.getByTestId('pending-spinner')).toBeInTheDocument();
  });
});
