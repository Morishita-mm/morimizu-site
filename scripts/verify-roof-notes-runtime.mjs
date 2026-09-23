// Isolated local Worker for the Notes navigation and filtering checks.
import { spawn } from 'node:child_process';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';
const { mf } = await createLocalJournalRuntime();
try {
  const base = (await mf.ready).origin;
  process.exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['scripts/verify-notes-sections.mjs'],
      {
        env: { ...process.env, NOTES_PREVIEW_URL: base },
        stdio: 'inherit',
      },
    );
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
} finally {
  await mf.dispose();
}
