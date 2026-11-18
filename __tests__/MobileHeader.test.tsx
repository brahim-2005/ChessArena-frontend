import { fireEvent, render, screen, within } from '@testing-library/react';
import { MobileHeader } from '../src/components/MobileHeader';
import { I18nProvider } from '../src/lib/i18n/context';

jest.mock('../src/lib/auth', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: jest.fn() }),
}));

describe('mobile navigation', () => {
  it('shows sign-in and exposes the desktop navigation destinations in the menu', () => {
    render(
      <I18nProvider>
        <MobileHeader />
      </I18nProvider>
    );

    expect(screen.getByRole('link', { name: 'Sign In' })).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    const navigation = screen.getByRole('dialog', { name: 'Site navigation' });
    for (const label of ['Home', 'Play', 'Puzzles', 'Learn', 'Tournaments', 'Live', 'Sessions', 'Clubs', 'Leaderboard', 'Community', 'Profile', 'Settings']) {
      expect(within(navigation).getByRole('link', { name: label })).not.toBeNull();
    }
    expect(within(navigation).getByRole('link', { name: 'Register Free' })).not.toBeNull();
  });

  it('closes the menu after navigating', () => {
    render(
      <I18nProvider>
        <MobileHeader />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Puzzles' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
