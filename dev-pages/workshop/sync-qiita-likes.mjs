import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const destination = new URL('./qiita-likes.json', import.meta.url);
export async function fetchQiitaLikes(fetcher = fetch) {
  const likes = {};
  for (let page = 1; page <= 10; page++) {
    const response = await fetcher(
      `https://qiita.com/api/v2/users/morimizu/items?per_page=100&page=${page}`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok) throw new Error(`Qiita API returned ${response.status}`);
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error('Unexpected Qiita response');
    for (const item of items) {
      if (item.private !== false) continue;
      if (
        !/^[a-f0-9]{20}$/.test(item.id) ||
        !Number.isSafeInteger(item.likes_count) ||
        item.likes_count < 0
      )
        throw new Error('Invalid Qiita article statistics');
      likes[item.id] = item.likes_count;
    }
    if (items.length < 100)
      return { fetchedAt: new Date().toISOString(), likes };
  }
  throw new Error(
    'Pagination limit reached; keeping previous complete snapshot',
  );
}

export async function syncLikes({ force = false } = {}) {
  const existing = JSON.parse(await readFile(destination, 'utf8'));
  // A local preview restart/build within an hour should not spend more API requests.
  if (
    !force &&
    existing.fetchedAt &&
    Date.now() - Date.parse(existing.fetchedAt) < 3600000
  )
    return;
  try {
    const snapshot = await fetchQiitaLikes();
    const temporary = new URL('./qiita-likes.json.tmp', import.meta.url);
    await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
    await rename(temporary, destination);
    console.log(
      `Qiita: updated likes for ${Object.keys(snapshot.likes).length} public articles.`,
    );
  } catch (error) {
    console.warn(
      `Qiita: ${error.message}. Keeping previous snapshot; unavailable counts are not shown as zero.`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  await syncLikes({ force: process.argv.includes('--force') });
