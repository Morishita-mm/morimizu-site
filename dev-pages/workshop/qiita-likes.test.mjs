import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchQiitaLikes } from './sync-qiita-likes.mjs';

const item = (count, id = '00000000000000000001') => ({
  id,
  likes_count: count,
  private: false,
});
await test('public likes include zero and omit private items', async () => {
  const result = await fetchQiitaLikes(async () =>
    Response.json([
      item(0),
      item(12, '00000000000000000002'),
      { ...item(99, '00000000000000000003'), private: true },
    ]),
  );
  assert.deepEqual(result.likes, {
    '00000000000000000001': 0,
    '00000000000000000002': 12,
  });
  assert.ok(Number.isFinite(Date.parse(result.fetchedAt)));
});
await test('pagination requests the next page and merges all counts', async () => {
  let calls = 0;
  const result = await fetchQiitaLikes(async (url) => {
    calls++;
    assert.ok(url.endsWith(`page=${calls}`));
    return Response.json(
      calls === 1
        ? Array.from({ length: 100 }, (_, i) =>
            item(i, i.toString(16).padStart(20, '0')),
          )
        : [item(8, 'ffffffffffffffffffff')],
    );
  });
  assert.equal(calls, 2);
  assert.equal(Object.keys(result.likes).length, 101);
});
await test('API failures do not produce fake zero counts', async () => {
  await assert.rejects(
    fetchQiitaLikes(async () => new Response('', { status: 429 })),
    /429/,
  );
  await assert.rejects(
    fetchQiitaLikes(async () => Response.json({ message: 'error' })),
    /Unexpected/,
  );
  await assert.rejects(
    fetchQiitaLikes(async () => Response.json([item(-1)])),
    /Invalid/,
  );
  await assert.rejects(
    fetchQiitaLikes(async () => Response.json([item('12')])),
    /Invalid/,
  );
  await assert.rejects(
    fetchQiitaLikes(async () => {
      throw new Error('offline');
    }),
    /offline/,
  );
});
