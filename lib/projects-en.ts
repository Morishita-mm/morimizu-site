import type { Project } from '@/lib/projects';

export const projectsEn: Project[] = [
  {
    slug: 'lissue',
    number: '01',
    name: 'Lissue',
    shortName: 'lissue',
    category: 'LOCAL ISSUE CLI / TUI',
    status: 'Public',
    statusDetail: 'crates.io v0.2.0',
    tagline: 'Local issue tracking between Git and AI coding agents.',
    summary:
      'A Rust CLI for keeping development tasks close to the code. Humans use the TUI, while AI agents use commands and structured JSON to work with the same tasks.',
    repositoryUrl: 'https://github.com/Morishita-mm/Lissue',
    primaryLink: {
      label: 'View on crates.io',
      href: 'https://crates.io/crates/lissue',
    },
    visual: 'lissue',
    image: {
      src: '/projects/lissue-tui.webp',
      alt: 'Lissue TUI showing tasks and related files',
      caption: 'Captured from the working TUI demo',
    },
    architecture: {
      src: '/projects/architecture/lissue-en.svg',
      alt: 'Lissue architecture connecting its CLI and TUI, application core, SQLite, JSON files, and Git',
    },
    languages: ['Rust'],
    stack: ['Rust', 'Ratatui', 'SQLite', 'JSON'],
    facts: [
      { label: 'Install', value: 'cargo install lissue' },
      { label: 'Release', value: 'v0.2.0' },
      { label: 'Tests', value: '41 tests passed' },
    ],
    challenge:
      'GitHub Issues are useful, but they can feel distant from the code and from AI-assisted workflows. A single shared TODO file creates a different problem: concurrent work often produces merge conflicts.',
    answer:
      'Lissue keeps fast local operations in SQLite and syncs shared state as one JSON file per task. A human-focused TUI and agent-friendly structured commands sit on top of the same data model.',
    flow: [
      {
        label: 'INIT',
        title: 'Place',
        detail: 'Initialize .lissue in a repository',
      },
      {
        label: 'ADD',
        title: 'Connect',
        detail: 'Attach context and related files',
      },
      {
        label: 'CLAIM',
        title: 'Assign',
        detail: 'Let a person or agent claim work',
      },
      {
        label: 'CONTEXT',
        title: 'Hand off',
        detail: 'Collect the context needed next',
      },
    ],
    decisions: [
      {
        title: 'Split responsibility between SQLite and JSON',
        detail:
          'SQLite handles fast searches and updates. Human-readable JSON files carry the shared state through Git.',
      },
      {
        title: 'Store one task per file',
        detail:
          'Independent tasks no longer compete for one large file. In the project benchmark, adding a task at 1,000 records improved from about 80 ms to about 0.37 ms.',
      },
      {
        title: 'Separate local IDs from shared UUIDs',
        detail:
          'The CLI stays convenient with short sequential IDs, while synchronized records use collision-resistant UUIDs.',
      },
    ],
    evidence: [
      'Three versions published on crates.io',
      '34 unit tests and 7 CLI integration tests',
      'Used for task management in other personal projects',
      'Published under MIT OR Apache-2.0',
    ],
    now: 'Version 0.2.0 is publicly available. The core CLI and TUI workflows are working and covered by tests.',
    next: [
      'Automate tests and formatting with GitHub Actions',
      'Align GitHub releases and tags with crates.io versions',
      'Clean up legacy repository URLs and copy',
    ],
  },
  {
    slug: 'ragy',
    number: '02',
    name: 'Ragy',
    shortName: 'ragy',
    category: 'LOCAL RAG / AGENT TOOLING',
    status: 'In daily use',
    statusDetail: 'local-first development system',
    tagline: 'A local knowledge layer between project documents and AI tools.',
    summary:
      'A personal RAG platform that synchronizes project documents and exposes the same knowledge through a CLI, TUI, and MCP. Search, sync status, and caching all share one local-first entry point.',
    repositoryUrl: 'https://github.com/Morishita-mm/My-RAG-Agent-System',
    visual: 'ragy',
    architecture: {
      src: '/projects/architecture/ragy-en.svg',
      alt: 'Ragy architecture showing the document synchronization lane and interactive RAG query lane',
    },
    languages: ['Rust', 'Python'],
    stack: ['Rust', 'Python', 'Dify', 'Redis', 'Ollama'],
    facts: [
      { label: 'Interfaces', value: 'CLI / TUI / MCP' },
      { label: 'Documents', value: 'md / pdf / docx / xlsx / images' },
      { label: 'Runtime', value: 'local-first' },
    ],
    challenge:
      'Design decisions are scattered across READMEs, notes, issues, and images. Copying that context into every AI session is repetitive, while mixing knowledge from different projects makes retrieval unreliable.',
    answer:
      'Ragy isolates a knowledge base per project and synchronizes only changed documents. Search, chat, and system status are grouped behind one command, with the same context available to editors through MCP.',
    flow: [
      {
        label: 'INIT',
        title: 'Isolate',
        detail: 'Create a knowledge base per project',
      },
      {
        label: 'SYNC',
        title: 'Refresh',
        detail: 'Upload only changed documents',
      },
      { label: 'ASK', title: 'Retrieve', detail: 'Search from the TUI or MCP' },
      {
        label: 'TRACE',
        title: 'Inspect',
        detail: 'Follow sync and retrieval state',
      },
    ],
    decisions: [
      {
        title: 'Isolate context by project',
        detail:
          'Dataset and cache namespaces are separated so unrelated project knowledge is less likely to leak into an answer.',
      },
      {
        title: 'Synchronize only the delta',
        detail:
          'File hashes are recorded and background workers update only documents that have actually changed.',
      },
      {
        title: 'Offer multiple interfaces to one core',
        detail:
          'The CLI handles routine work, the TUI supports browsing and conversation, and MCP provides context during coding.',
      },
    ],
    evidence: [
      'Rust CLI/TUI and Python sync services maintained in one repository',
      'Tests cover document sync, retrieval, and context optimization',
      'Ingestion for Markdown, PDF, Word, Excel, and images',
      'Local synchronization and retrieval benchmarks recorded',
    ],
    now: 'I use Ragy in my own development environment while continuing to add features. Public release naming and versioning are still being consolidated.',
    next: [
      'Align versions across README, Cargo, and GitHub releases',
      'Add real TUI screenshots and a short onboarding demo',
      'Run the test suite in GitHub Actions',
    ],
  },
  {
    slug: 'rust-log-analyzer',
    number: '03',
    name: 'Rust Log Analyzer',
    shortName: 'log analyzer',
    category: 'REALTIME LOG TUI',
    status: 'Technical prototype',
    statusDetail: 'working proof of concept',
    tagline: 'Read a continuous stream of logs without leaving the terminal.',
    summary:
      'A message-driven experiment that receives logs through Redis and renders them in a real-time Rust TUI. Python and Polars aggregate one-second windows so raw events and operational signals stay in the same view.',
    repositoryUrl: 'https://github.com/Morishita-mm/rust-log-analyzer',
    visual: 'rust-log-analyzer',
    image: {
      src: '/projects/rust-log-analyzer.webp',
      alt: 'Rust Log Analyzer terminal displaying log events and aggregate metrics',
      caption: 'Captured from the working demo',
    },
    architecture: {
      src: '/projects/architecture/rust-log-analyzer-en.svg',
      alt: 'Rust Log Analyzer architecture connecting log sources, Redis, Rust and Python processors, and the terminal interface',
    },
    languages: ['Rust', 'Python'],
    stack: ['Rust', 'Tokio', 'Ratatui', 'Python', 'Polars', 'Redis'],
    facts: [
      { label: 'Display', value: 'realtime TUI' },
      { label: 'Aggregation', value: '1 second window' },
      { label: 'Architecture', value: 'message-driven' },
    ],
    challenge:
      'Investigating logs from several services often means switching between tools for viewing, filtering, and aggregation. I wanted to explore a terminal-only workflow that remains responsive under a continuous stream.',
    answer:
      'Redis Pub/Sub carries the messages, Rust and Tokio own the interactive display, and Python with Polars handles aggregation. The TUI supports regex filters, Vim-style navigation, and copying selected events.',
    flow: [
      {
        label: 'INGEST',
        title: 'Stream',
        detail: 'Publish service logs to Redis',
      },
      {
        label: 'ANALYZE',
        title: 'Aggregate',
        detail: 'Compute one-second windows in Polars',
      },
      {
        label: 'PUBLISH',
        title: 'Return',
        detail: 'Publish metrics on another channel',
      },
      {
        label: 'INSPECT',
        title: 'Investigate',
        detail: 'Filter, select, and copy in the TUI',
      },
    ],
    decisions: [
      {
        title: 'Decouple each stage with messages',
        detail:
          'Producers, aggregation, and presentation can evolve independently as long as they keep the same channel contracts.',
      },
      {
        title: 'Use Rust for the interactive path',
        detail:
          'Tokio handles asynchronous events while Ratatui keeps terminal rendering and keyboard input responsive.',
      },
      {
        title: 'Use Python where analysis is stronger',
        detail:
          'Polars makes windowed aggregation concise, allowing the prototype to test the system boundary instead of reimplementing analytics.',
      },
    ],
    evidence: [
      'Working Docker Compose environment with Redis and sample producers',
      'Live log consumption and one-second aggregation implemented',
      'Regex filtering, keyboard navigation, and OSC 52 copy support',
      'Rust and Python services communicate only through Redis channels',
    ],
    now: 'The end-to-end prototype works locally: sample producers emit logs, the analyzer publishes metrics, and the terminal renders both streams.',
    next: [
      'Add reproducible performance measurements',
      'Document message schemas and failure recovery',
      'Add CI for both Rust and Python services',
    ],
  },
];

export function getProjectEn(slug: string) {
  return projectsEn.find((project) => project.slug === slug);
}
