> この文書はPhase 1の設計記録です。現行方式は [Journal実行時管理](journal-runtime-design.md) と [運用手順](journal-operations.md) を参照してください。静的出版・会話取込の将来案は現行の運用ではありません。

# Engineering Journal / Public Lab

## Decision: Phase 1

`/journal` is the public chronological record of engineering judgment. `/notes`
remains the Qiita mirror, and `/projects` remains the implementation portfolio.
“Journal” covers questions, unfinished thinking, decisions and failures as well
as experiments; “Lab” describes the longer-term purpose, not a second content
system. Header/footer navigation makes the section reachable without replacing
Notes. Existing colors, type, borders and Markdown styling are reused. On narrow
phones the four navigation items use a second row to retain touch targets.

```text
QiitaArticle/public/*.md                 morimizu-site/content/journal/*.md
    ↓ existing one-way sync                   ↓ YAML validation + public projection
lib/generated/qiita-articles.ts          lib/generated/journal-entries.ts
    ↓ /notes, /en/notes                       ↓ /journal, /journal/[id]
```

The Journal build never reads Qiita as its authoring store, writes back to it, or
imports raw conversations. Its Markdown is the durable source of truth; generated
TypeScript is ignored and disposable. No database, new dependency, remote API,
API key, class hierarchy or editing dashboard is needed.

## Content contract (v1)

Runtime validation lives in `scripts/journal/schema.mjs`; the public TypeScript
shape lives in `lib/journal/types.ts`. `scripts/prepare-journal.mjs` is the only
authoring-to-runtime handoff. The UI imports only its public projection.

| Field                        | Contract / purpose                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                         | Required stable lowercase kebab-case identifier; filename is `<id>.md`, URL is `/journal/<id>`. No separate mutable slug in Phase 1.                                                    |
| `title`, `createdAt`, `kind` | Required. Dates are quoted ISO `YYYY-MM-DD`.                                                                                                                                            |
| `updatedAt`                  | Defaults to createdAt; must not precede creation.                                                                                                                                       |
| `kind`                       | `log`, `hypothesis`, `experiment`, `decision`, `failure`, `article`. Common Entry model, not six systems.                                                                               |
| `status`                     | `draft` (default), `published`, `archived`. Archived is not publicly served in Phase 1.                                                                                                 |
| `visibility`                 | `private` (default), `public`. Both public visibility and published status are required for output. No unlisted URLs.                                                                   |
| `language`                   | `ja` (default) or `en`. Identifies the body language, not an automatic translation request.                                                                                             |
| `publishedAt`                | Required when published; creation ≤ publication ≤ update. Future scheduling is rejected.                                                                                                |
| `summary`                    | Required when published, ≤400 characters.                                                                                                                                               |
| `tags`                       | String array, default empty. No taxonomy service.                                                                                                                                       |
| `projects`                   | Existing project slugs. Known projects link to their pages; unknown ones render as plain text, never a broken link.                                                                     |
| `relatedEntries`             | Entry IDs. Missing IDs/duplicates/self-links fail validation. References to nonpublic entries are removed from the public projection. Directional links; reciprocal links are optional. |
| `hypothesis`, `result`       | Optional compact plain text, with detailed method/interpretation in Markdown.                                                                                                           |
| `confidence`                 | Optional `low/medium/high`, explicitly the author's assessment, not a measured success probability.                                                                                     |
| `sourceType`                 | `manual` (default), `conversation-derived`, `evaluation`. Descriptive only; does not activate ingestion.                                                                                |

`kind` is a useful maturity/context signal, not a success badge. Publication is
not evidence that a hypothesis is true. A rejected hypothesis stays a hypothesis
whose result/interpretation records rejection. Create a new linked Entry for the
next hypothesis rather than silently replacing the old claim. List order uses
publishedAt, then createdAt and ID; editing updatedAt does not reorder history.
Git preserves textual revisions. Stable IDs avoid breaking links when titles
change. Future translation groups or structured relation types can be optional
fields introduced with validation/migration tests, without changing IDs.

### Recording the planned research

- Bounded Context as an Agent cognitive boundary: record the original claim,
  then a linked experiment. The information supplied so far is **反証寄り**;
  method, numbers and causal explanations must remain unrecorded until supplied.
- Abstract vs concrete instructions: use hypothesis → experiment → interpretation.
- Human-selected vs Agent-selected libraries: isolate this as an experimental condition.
- Architecture constraints: use decision Entries for the chosen constraint and
  link experiments that influenced it.
- When to return decisions to a human: record a hypothesis, then failures or
  incidents that changed the escalation rule.

No sample asserts these experiments have been performed. Included public sample
Entries are visibly labeled **記録例／未実施**. The private sample is harmless dummy
content used to verify exclusion, not a template for storing sensitive data.

## Privacy boundary and threat model

1. Keep raw conversations and sensitive drafts **outside this public repository**,
   not just outside `public/`. A draft committed to a public Git repository is
   already public even if the website hides it.
2. `.journal-private/` is ignored as an emergency local-only convention. The
   application, content compiler and font compiler do not read it. `.gitignore`
   is not encryption or access control and can be bypassed with `git add -f`.
3. `content/journal` accepts only regular top-level Markdown files. Symlinks,
   nested directories, executable front matter and unknown fields are rejected.
   No MDX or arbitrary JavaScript execution is introduced.
4. All authoring entries are validated, but only `published && public` entries
   are explicitly projected into the generated module. Raw source references,
   conversations and candidate evidence have no public schema fields.
5. The existing sanitized `MarkdownArticle` renderer handles the public body.
   It does not declassify content. Known credential shapes and credential-bearing
   URL parameters cause validation failure without printing their values. This
   is only a backstop: personal data, work context and arbitrary secret URLs
   cannot reliably be detected by a regex.
6. Build order is Qiita sync → Journal validation/projection → fonts → static
   build → artifact check. Fonts see the generated public Journal data, never
   authoring drafts. The artifact check examines client and server output for
   distinctive unpublished IDs/titles/bodies (excluding short or already-public
   common text) and the test raw-inbox canary. It also rejects
   stale public projections and stale Journal routes. A failed generation removes
   the previously generated Journal module so failure cannot reuse it silently.
7. `predeploy` repeats the artifact check against current Markdown. Use the
   documented npm workflow, not a direct Wrangler invocation that bypasses it.
   There is no command that promotes a draft or deploys content automatically.
   Existing CI deploys only after a human chooses to commit/merge publication
   changes; no import/extraction pipeline can set publication state.

Manual review remains mandatory. Review the exact content diff, links, screenshots,
and publication fields before publishing. If private data has already been pushed,
marking it draft is insufficient: remove public artifacts/caches, rotate exposed
credentials, and address Git history separately. Retractions need a rebuild and
deployment; static pages do not disappear when only the local file changes.

## Phase 2: private ingestion and assisted extraction (design only)

```text
ConversationSource / Input Adapter
  Markdown transcript | plain text | JSON export | pasted text | future connector
    ↓ normalized private Conversation (opaque id, messages, source location)
Private Inbox (outside public repo, local access controls)
    ↓ Extractor (provider adapter: OpenAI or another engine; optional/offline stub)
Candidates (Claim / Question / Hypothesis / Decision / Experiment / Failure)
    ↓ Human Review → DraftBuilder → public-safe Markdown draft
    ↓ Human edit / review → explicit publication state → git commit / deploy
```

Proposed CLI, **not implemented**:

```sh
npm run journal:ingest -- conversation.md
npm run journal:extract -- <conversation-id>
npm run journal:draft -- <reviewed-candidate-id>
```

- **ConversationSource** retrieves/parses input, not its meaning. Normalize
  messages with stable internal IDs; preserve the original file privately.
  No dependency on ChatGPT internal APIs or UI scraping.
- **Extractor** proposes supported claims/questions/changes, not polished invented
  prose. Each private candidate has `id`, `type`, `text`, `sourceReferences`
  (conversation/message IDs or line ranges), evidence spans, `confidence`, and
  an optional relation/change proposal against an existing Entry. Distinguish
  the human's claim from an assistant suggestion and from extractor inference.
  Missing evidence means a question/unknown, not an invented result.
- **Provider Adapter** receives only explicitly approved inputs. Local-first
  storage does not mean sending confidential material to a remote LLM is safe;
  obtain consent/redact first. Treat transcript instructions as untrusted data.
  API keys stay in environment/private configuration, never in candidates or
  Markdown. Site build and deployment must not import or require this adapter.
- **DraftBuilder** only structures reviewed candidates, preserves uncertainty,
  and excludes source references/evidence/raw data from public Markdown. It writes
  draft/private state, never published. Human review checks unsupported additions
  and whether a “change of judgment” is actually supported by the source.
- **Publisher** is an explicit human action and public-schema projection, not an
  LLM tool. Future approval should bind to a content digest so subsequent edits
  invalidate approval. No cron, auto-promotion, or unattended publishing.

These are responsibility boundaries, not required classes or a plugin framework.
Private schemas can evolve independently from the durable public Entry contract.

## Phase 3: evaluation platform integration (design only)

Link a Journal experiment to a public-safe evaluation/run identifier or approved
result artifact. Candidate metrics: model/config revision, sample size, token
usage, latency, test pass rate, human intervention and failure categories.
Keep measured results distinct from interpretation and architecture decisions.
Raw prompts, proprietary tasks and traces remain private. Add optional structured
references only when a real producer exists; no graph/vector database, embeddings,
semantic search or live experiment service in Phase 1.

## Verification / implementation references

`npm run test:journal` covers the schema/publication boundary; `npm run build`
includes the client/server artifact check. Browser checks are documented in
`journal-operations.md`. No Qiita source/sync/Notes implementation is changed.

- [gray-matter's supported engines](https://github.com/jonschlinkert/gray-matter)
- [Static route parameters](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

Implementation was checked against the installed Vinext static-export behavior,
not assumed to be identical to every upstream Next.js feature.
