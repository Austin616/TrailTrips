import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeAuthDestination } from '../lib/supabase/redirect';

test('OAuth only returns to same-origin non-auth pages', () => {
  const origin = 'https://trailtrips.example';
  for (const next of [null, 'https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/auth/callback?code=old', 'https://[invalid']) {
    assert.equal(safeAuthDestination(next, origin).href, `${origin}/trips`);
  }
  assert.equal(safeAuthDestination('/explore?destination=Oregon', origin).href, `${origin}/explore?destination=Oregon`);
});
