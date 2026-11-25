import { describe, expect, it, vi } from 'vitest';
import { authenticatedMeetingUser } from '../../supabase/functions/summarize-meeting/auth';

describe('meeting summary authorization', () => {
  it('rejects missing authorization without contacting auth', async () => {
    const getUser = vi.fn();
    expect(await authenticatedMeetingUser(null, getUser)).toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });
  it('rejects invalid or anonymous tokens', async () => {
    const getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') });
    expect(await authenticatedMeetingUser('Bearer public-anon-token', getUser)).toBeNull();
  });
  it('accepts only a validated user identity', async () => {
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    expect(await authenticatedMeetingUser('Bearer session-token', getUser)).toBe('user-123');
    expect(getUser).toHaveBeenCalledWith('session-token');
  });
});