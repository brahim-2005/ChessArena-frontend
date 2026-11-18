import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import SocialPage from '../src/app/social/page';
import { supabase } from '../src/lib/supabase/client';
import { I18nProvider } from '../src/lib/i18n/context';

jest.mock('../src/lib/auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockedSupabase = supabase as unknown as {
  from: jest.Mock;
  rpc: jest.Mock;
};

function makeQuery(data: unknown, terminalMethod: 'or' | 'in' | 'limit') {
  const query = {
    select: jest.fn(),
    or: jest.fn(),
    in: jest.fn(),
    ilike: jest.fn(),
    neq: jest.fn(),
    limit: jest.fn(),
    order: jest.fn(),
  };
  for (const method of ['select', 'or', 'in', 'ilike', 'neq', 'limit', 'order'] as const) {
    if (method === terminalMethod) {
      query[method].mockResolvedValue({ data, error: null });
      continue;
    }
    query[method].mockReturnValue(query);
  }
  return query;
}

describe('Community friend chat', () => {
  beforeEach(() => {
    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === 'friendships') {
        return makeQuery([{
          id: 'friendship-1',
          user_id: 'user-1',
          friend_id: 'friend-1',
          status: 'accepted',
        }], 'or');
      }
      if (table === 'profiles') {
        return makeQuery([{ id: 'friend-1', username: 'Knight', rating: 1200 }], 'in');
      }
      return makeQuery([], 'limit');
    });
    mockedSupabase.rpc.mockResolvedValue({ error: null });
  });

  it('lets a player send a message containing an emoji to an accepted friend', async () => {
    render(<I18nProvider><SocialPage /></I18nProvider>);

    fireEvent.click(await screen.findByRole('button', { name: 'Message' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Write a message' }), {
      target: { value: 'Good game ' },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Toggle emoji picker' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add 😀 emoji' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(mockedSupabase.rpc).toHaveBeenCalledWith('send_direct_message', {
        p_recipient_id: 'friend-1',
        p_body: 'Good game 😀',
      });
    });
  });
});
