import { render, screen } from '@testing-library/react';
import { vi, expect } from 'vitest';
import BaseHeader from '@/uikit/components/BaseHeader';
import { PublicAssetsPath } from '@/base/cases/PublicAssetsPath';

// Mock dependencies
const mockPublicAssetsPath = new PublicAssetsPath('');

vi.mock('@/core/IOC', () => ({
  IOC: vi.fn((key) => {
    if (key === 'AppConfig') {
      return { appName: 'Test App' };
    }
    if (key === PublicAssetsPath) {
      return mockPublicAssetsPath;
    }
    return {};
  })
}));

// Mock child components
vi.mock('@/uikit/components/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher">Theme Switcher</div>
}));

interface LocaleLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

vi.mock('@/uikit/components/LocaleLink', () => ({
  default: ({ children, href, className }: LocaleLinkProps) => (
    <a href={href} className={className} data-testid="locale-link">
      {children}
    </a>
  )
}));

vi.mock('@/uikit/components/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">Language Switcher</div>
}));

vi.mock('@/uikit/components/LogoutButton', () => ({
  default: () => <div data-testid="logout-button">Logout</div>
}));

describe('BaseHeader', () => {
  it('renders header with correct structure', () => {
    render(<BaseHeader />);
    expect(screen.getByTestId('base-header')).toBeDefined();
  });

  it('renders logo and app name correctly', () => {
    render(<BaseHeader />);
    const logo = screen.getByTestId('base-header-logo');
    const appName = screen.getByTestId('base-header-app-name');

    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toBe('/logo.svg');
    expect(logo.getAttribute('alt')).toBe('logo');
    expect(appName).toBeDefined();
    expect(appName.textContent).toBe('Test App');
  });

  it('renders theme and language switchers', () => {
    render(<BaseHeader />);
    expect(screen.getByTestId('theme-switcher')).toBeDefined();
    expect(screen.getByTestId('language-switcher')).toBeDefined();
  });

  it('renders logout button when showLogoutButton is true', () => {
    render(<BaseHeader showLogoutButton />);
    expect(screen.getByTestId('logout-button')).toBeDefined();
  });

  it('does not render logout button when showLogoutButton is false', () => {
    render(<BaseHeader showLogoutButton={false} />);
    expect(screen.queryByTestId('logout-button')).toBeNull();
  });

  it('renders home link correctly', () => {
    render(<BaseHeader />);
    const link = screen.getByTestId('locale-link');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });
});
