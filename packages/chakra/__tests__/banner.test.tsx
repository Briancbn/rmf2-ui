import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from './utils';
import {
  BannerRoot,
  BannerHeader,
  BannerContent,
  BannerButton,
} from '@/horizon/components/banner/banner';

describe('BannerRoot', () => {
  it('renders children', () => {
    render(<BannerRoot>Banner content</BannerRoot>);
    expect(screen.getByText('Banner content')).toBeInTheDocument();
  });

  it('accepts additional chakra props', () => {
    render(<BannerRoot data-testid="banner-root" />);
    expect(screen.getByTestId('banner-root')).toBeInTheDocument();
  });

  it('uses horizonTeal gradient by default', () => {
    const { container } = render(<BannerRoot />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts a custom colorPalette', () => {
    const { container } = render(<BannerRoot colorPalette="blue" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('BannerHeader', () => {
  it('renders children', () => {
    render(<BannerHeader>Hello World</BannerHeader>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('accepts additional text props', () => {
    render(<BannerHeader data-testid="banner-header">Title</BannerHeader>);
    expect(screen.getByTestId('banner-header')).toBeInTheDocument();
  });
});

describe('BannerContent', () => {
  it('renders children', () => {
    render(
      <BannerContent>
        <span>Child A</span>
        <span>Child B</span>
      </BannerContent>,
    );
    expect(screen.getByText('Child A')).toBeInTheDocument();
    expect(screen.getByText('Child B')).toBeInTheDocument();
  });

  it('accepts additional flex props', () => {
    render(<BannerContent data-testid="banner-content" gap="10px" />);
    expect(screen.getByTestId('banner-content')).toBeInTheDocument();
  });
});

describe('BannerButton', () => {
  it('renders children', () => {
    render(<BannerButton>Click me</BannerButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<BannerButton data-testid="banner-btn">Go</BannerButton>);
    expect(screen.getByTestId('banner-btn').tagName).toBe('BUTTON');
  });

  it('accepts additional button props', () => {
    render(
      <BannerButton data-testid="banner-btn" disabled>
        Disabled
      </BannerButton>,
    );
    expect(screen.getByTestId('banner-btn')).toBeDisabled();
  });
});
