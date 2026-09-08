import { isAdmin, secretMatches } from './auth.mjs';
import { manuscriptTemplate } from './template.mjs';
import {
  JournalError,
  database,
  ingest,
  adminList,
  adminEntry,
  change,
  publicList,
  publicEntry,
} from './store.mjs';

export function protect(response, privatePage = false, privatePreview = false) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  if (privatePage) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    // Private previews must not contact remote image/iframe endpoints.
    headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; frame-src 'none'; form-action 'self'" +
        (privatePreview ? "; img-src 'self' data:" : ''),
    );
  }
  return new Response(response.body, { status: response.status, headers });
}
export async function boundedText(request, max) {
  if (Number(request.headers.get('content-length')) > max)
    throw new JournalError(413, 'Manuscript too large');
  const reader = request.body?.getReader();
  if (!reader) return '';
  let size = 0;
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new JournalError(413, 'Manuscript too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new JournalError(400, 'UTF-8 required');
  }
}
export async function handleJournal(request, env, next) {
  let path;
  try {
    path = decodeURIComponent(new URL(request.url).pathname).replace(
      /\/+$/,
      '',
    );
  } catch {
    return protect(new Response('Not found', { status: 404 }), true);
  }
  const journal =
    path === '/journal' ||
    path.startsWith('/journal/') ||
    path.startsWith('/api/journal');
  if (!journal) return next(request);
  const admin =
    path === '/journal/admin' ||
    path.startsWith('/journal/admin/') ||
    path.startsWith('/api/journal/admin') ||
    path === '/api/journal/v1/drafts';
  const privatePage =
    admin ||
    path.startsWith('/journal/share') ||
    path.startsWith('/api/journal');
  try {
    if (admin && !(await isAdmin(request, env)))
      throw new JournalError(401, 'Administrator authentication required');
    if (path.startsWith('/api/journal')) {
      const url = new URL(request.url);
      let result;
      if (path === '/api/journal/admin/template' && request.method === 'GET') {
        return protect(
          new Response(manuscriptTemplate(), {
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
              'Content-Disposition': 'attachment; filename=journal-template.md',
            },
          }),
          true,
        );
      } else if (
        path === '/api/journal/admin/drafts' &&
        request.method === 'PUT'
      ) {
        if (request.headers.get('origin') !== url.origin)
          throw new JournalError(403, 'Same-origin upload required');
        if (!request.headers.get('content-type')?.startsWith('text/markdown'))
          throw new JournalError(415, 'text/markdown required');
        result = await ingest(
          database(env),
          await boundedText(request, 256 * 1024),
        );
      } else if (
        path === '/api/journal/v1/drafts' &&
        request.method === 'PUT'
      ) {
        // Legacy CLI additionally requires the same owner Access JWT as the browser.
        // A standalone bearer token can never grant upload access.
        if (
          !(await secretMatches(
            request.headers.get('authorization')?.replace(/^Bearer /, ''),
            env.JOURNAL_UPLOAD_TOKEN,
          ))
        )
          throw new JournalError(401, 'Upload authentication required');
        if (!request.headers.get('content-type')?.startsWith('text/markdown'))
          throw new JournalError(415, 'text/markdown required');
        result = await ingest(
          database(env),
          await boundedText(request, 256 * 1024),
        );
      } else if (
        path === '/api/journal/admin/entries' &&
        request.method === 'GET'
      ) {
        result = await adminList(
          database(env),
          url.searchParams.get('after') ?? '',
        );
      } else if (/^\/api\/journal\/admin\/entries\/[a-z0-9-]+$/.test(path)) {
        const id = path.split('/').at(-1);
        if (request.method === 'GET') {
          result = await adminEntry(database(env), id);
          if (!result) throw new JournalError(404, 'Not found');
          if (url.searchParams.has('source')) {
            const row = await database(env)
              .prepare(
                'SELECT source FROM journal_revisions WHERE entry_id=? AND revision=?',
              )
              .bind(id, result.draft_revision)
              .first();
            return protect(
              new Response(row.source, {
                headers: {
                  'Content-Type': 'text/markdown; charset=utf-8',
                  'Content-Disposition': `attachment; filename="${id}.md"`,
                },
              }),
              true,
            );
          }
        } else if (request.method === 'POST') {
          if (
            request.headers.get('origin') !== url.origin ||
            request.headers.get('content-type') !== 'application/json'
          )
            throw new JournalError(403, 'Same-origin JSON required');
          let input;
          try {
            input = JSON.parse(await boundedText(request, 16 * 1024));
          } catch (error) {
            if (error instanceof JournalError) throw error;
            throw new JournalError(400, 'Invalid JSON');
          }
          if (!input || typeof input !== 'object')
            throw new JournalError(400, 'Invalid action');
          result = await change(database(env), id, input);
        } else throw new JournalError(405, 'Method not allowed');
      } else if (
        path === '/api/journal/v1/entries' &&
        request.method === 'GET'
      ) {
        result = await publicList(
          database(env),
          url.searchParams.get('before') ?? '',
          url.searchParams.get('sort') ?? 'desc',
        );
      } else if (
        /^\/api\/journal\/v1\/entries\/[a-z0-9-]+$/.test(path) &&
        request.method === 'GET'
      ) {
        result = await publicEntry(database(env), path.split('/').at(-1));
        if (!result) throw new JournalError(404, 'Not found');
      } else throw new JournalError(404, 'Not found');
      return protect(Response.json(result), true);
    }
    if (!['GET', 'HEAD'].includes(request.method))
      throw new JournalError(405, 'Method not allowed');
    return protect(await next(request), privatePage, admin);
  } catch (error) {
    // Never log request bodies, URLs (share capabilities), JWTs or SQL errors.
    return protect(
      Response.json(
        {
          error:
            error instanceof JournalError
              ? error.message
              : 'Journal temporarily unavailable',
        },
        { status: error instanceof JournalError ? error.status : 503 },
      ),
      true,
    );
  }
}
