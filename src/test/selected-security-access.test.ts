import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const anonymous = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);

describe('selected database security regressions (live)', () => {
  it('rejects public image-cache listing', async () => {
    const { error } = await anonymous.from('image_cache').select('id').limit(1);
    expect(error?.code).toBe('42501');
  });

  it('rejects arbitrary direct anonymous vote insertion', async () => {
    const { error } = await anonymous.from('live_poll_votes').insert({
      poll_id: crypto.randomUUID(),
      voter_id: 'security-regression',
      choice: 'invalid',
    });
    expect(error?.code).toBe('42501');
  });
});