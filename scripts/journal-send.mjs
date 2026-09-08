#!/usr/bin/env node
// Portable Node 22 CLI. It knows only the versioned HTTP contract, no site paths.
import { lstat, readFile } from 'node:fs/promises';
const [file, ...extra] = process.argv.slice(2);
try {
  if (!file || extra.length)
    throw new Error('Usage: node journal-send.mjs /absolute/path/to/chosen.md');
  const endpoint = new URL('/api/journal/v1/drafts', process.env.JOURNAL_URL);
  if (
    endpoint.protocol !== 'https:' &&
    !(
      endpoint.protocol === 'http:' &&
      ['127.0.0.1', 'localhost'].includes(endpoint.hostname)
    )
  )
    throw new Error('HTTPS is required outside localhost');
  if (!process.env.JOURNAL_UPLOAD_TOKEN)
    throw new Error('Set JOURNAL_UPLOAD_TOKEN in your private environment');
  if (!process.env.JOURNAL_ACCESS_JWT)
    throw new Error(
      'Owner Access authentication is required. Use the admin upload page, or supply JOURNAL_ACCESS_JWT from an authenticated owner session.',
    );
  const stat = await lstat(file);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    !file.endsWith('.md') ||
    stat.size > 256 * 1024
  )
    throw new Error('Select one regular Markdown file (maximum 256 KiB)');
  const response = await fetch(endpoint, {
    method: 'PUT',
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
    headers: {
      Authorization: `Bearer ${process.env.JOURNAL_UPLOAD_TOKEN}`,
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cf-Access-Jwt-Assertion': process.env.JOURNAL_ACCESS_JWT,
    },
    body: await readFile(file),
  });
  if (response.status === 409)
    throw new Error(
      'This ID already has a different saved manuscript. Uploaded content is fixed and cannot be replaced.',
    );
  if (!response.ok)
    throw new Error(
      `Upload failed (${response.status}). Check authentication and Markdown fields; do not include status, visibility or publishedAt.`,
    );
  const result = await response.json();
  console.log(
    `Saved for review: ${new URL(`/journal/admin/${result.id}`, endpoint).href}\nRevision: ${result.revision}\nPublication settings were not changed.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
