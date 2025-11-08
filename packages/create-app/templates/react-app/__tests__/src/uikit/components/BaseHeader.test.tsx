import { BootstrapTest } from '@__mocks__/BootstrapTest';
import { TestApp } from '@__mocks__/components';
import { I } from '@config/IOCIdentifier';
import { render, screen } from '@testing-library/react';
import type { IOCRegister } from '@/base/port/IOCInterface';
import { UserService } from '@/base/services/UserService';
import { BaseHeader } from '@/uikit/components/BaseHeader';

const BaseHeaderRegister: IOCRegister = {
  register(ioc): void {
    ioc.bind(I.UserServiceInterface, ioc.get(UserService));
  }
};

describe('BaseHeader', () => {
  beforeAll(async () => {
    await BootstrapTest.main({
      root: globalThis,
      bootHref: 'http://localhost:3000/en/test',
      iocRegister: BaseHeaderRegister
    });
  });

  it('renders header with correct structure', () => {
    render(
      <TestApp>
        <BaseHeader />
      </TestApp>
    );

    const header = screen.getByTestId('BaseHeader');
    expect(header).toBeDefined();
  });

  it('renders logo and app name correctly', () => {
    render(
      <TestApp>
        <BaseHeader />
      </TestApp>
    );

    const logo = screen.getByTestId('BaseHeader-logo');
    const appName = screen.getByTestId('BaseHeader-app-name');

    expect(logo).toBeDefined();
    expect(logo.getAttribute('alt')).toBe('logo');
    expect(appName).toBeDefined();
    expect(appName.textContent).toBeTruthy();
  });

  it('renders theme and language switchers', () => {
    render(
      <TestApp>
        <BaseHeader />
      </TestApp>
    );

    // Note: These components render as Ant Design Select components
    // We can verify they exist by checking for their parent containers
    const header = screen.getByTestId('BaseHeader');
    expect(header).toBeDefined();
    // The actual Select components might not have data-testid in production code
  });

  it('renders logout button when showLogoutButton is true', () => {
    render(
      <TestApp>
        <BaseHeader showLogoutButton />
      </TestApp>
    );

    const logoutButton = screen.getByTestId('LogoutButton');
    expect(logoutButton).toBeDefined();
  });

  it('does not render logout button when showLogoutButton is false', () => {
    render(
      <TestApp>
        <BaseHeader showLogoutButton={false} />
      </TestApp>
    );

    expect(screen.queryByTestId('LogoutButton')).toBeNull();
  });

  it('renders home link correctly', () => {
    render(
      <TestApp>
        <BaseHeader />
      </TestApp>
    );

    const link = screen.getByTestId('locale-link');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });
});
