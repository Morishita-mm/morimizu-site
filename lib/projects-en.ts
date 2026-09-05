import type { Project } from './projects';

export const projectsEn: Project[] = [
  {
    slug: 'tech-interviewer',
    number: '01',
    name: 'Architecture Diagnostic',
    shortName: 'architecture-diagnostic',
    category: 'AI ARCHITECTURE SIMULATOR',
    status: 'Technical prototype',
    statusDetail: 'MVP v0.1.0 / Private Demo',
    tagline: 'Diagnosing architectural reasoning and trade-off rationale beyond textbook answers.',
    summary:
      'An autonomous system architecture interview simulator. Guides candidates through requirements, diagramming, 10x traffic spikes, and evidence locking to produce an unvarnished baseline report.',
    repositoryUrl: 'https://github.com/Morishita-mm/tech-interviewer',
    repositoryVisibility: 'private',
    visual: 'tech-interviewer',
    image: {
      src: '/projects/tech-interviewer-report.webp',
      alt: 'Architecture Diagnostic baseline report screen',
      caption: 'Actual baseline diagnostic report (Reference Case: Strong & Simple)',
    },
    architecture: {
      src: '/projects/architecture/tech-interviewer-en.svg',
      alt: 'Architecture Diagnostic system architecture showing candidate workspace, deterministic progression, AI boundary, and auto-retention',
    },
    languages: ['TypeScript'],
    stack: [
      'TypeScript',
      'React Router',
      'Express',
      'Firestore',
      'Cloud Run',
      'Ajv Draft 2020-12',
    ],
    facts: [
      { label: 'Session', value: '25 min Focused Diagnostic' },
      { label: 'Rubric', value: '6 Fixed Competency Axes' },
      { label: 'AI Control', value: 'Hard Budget & Deterministic' },
    ],
    challenge:
      'Knowing textbook patterns like load balancers or cache layers is common, but real-world engineering interviews demand explicit trade-off rationales and failure-mode decisions. General-purpose AI chat is overly agreeable, making it ineffective for objective self-assessment.',
    answer:
      'Provides a deterministic state machine that guides candidates through requirement elicitation, canvas diagramming, immutable Evidence Lock, and 10x scale constraints. Restricts AI evaluation with strict schemas and cost authorities to generate objective, unvarnished baseline reports.',
    flow: [
      {
        label: 'HEAR',
        title: 'Requirements',
        detail: 'Probe the AI interviewer to uncover latent assumptions and quality attributes',
      },
      {
        label: 'DESIGN',
        title: 'Architecture',
        detail: 'Build system diagrams on a canvas and formulate initial design decisions',
      },
      {
        label: 'LOCK',
        title: 'Evidence Lock',
        detail: 'Immutably commit answers to prevent retrospective evaluation drift',
      },
      {
        label: 'STRESS',
        title: 'Constraint Shift',
        detail: 'Adapt architecture to sudden 10x traffic surges or failure modes',
      },
      {
        label: 'REPORT',
        title: 'Baseline Report',
        detail: 'Produce a 6-axis Core Report highlighting positive and negative evidence',
      },
    ],
    decisions: [
      {
        title: 'Separation of Deterministic Flow & AI Evaluation',
        detail:
          'Interview progression, state transitions, and evidence collection are governed deterministically, isolating AI strictly to schema-bounded input projection and scoring to prevent hallucinations and ensure reproducibility.',
      },
      {
        title: 'Zero Idle Cost with 30-Day Automated Data Retention',
        detail:
          'Adopts a serverless design with zero standby expenses when idle, while automatically purging diagnostic sessions and personal responses after 30 days to strictly protect candidate privacy.',
      },
      {
        title: 'Provider-Agnostic AI Boundary with Hard Budget Ceiling',
        detail:
          'Decoupled from vendor-specific models via a unified adapter, enforcing hard cost limits per session to physically prevent runaway API charges.',
      },
    ],
    evidence: [
      'Architectural decision documentation detailing technology choices and rejected alternatives',
      'Deterministic evaluation replay tests against 4 reference fixtures',
      'End-to-end verification of real AI evaluation and cost authorities in cloud staging',
      'Strict input/output JSON Schema enforcement to reject malformed payload data',
    ],
    now: 'Fully functional local autonomous diagnostic flow (25-minute session) and reference report calibration workbench.',
    next: [
      'Owner acceptance testing for bounded private alpha',
      'Additional scenarios including payment processing and real-time chat',
      'Report persistence and export features',
    ],
  },
  {
    slug: 'lissue',
    number: '02',
    name: 'Lissue',
    shortName: 'lissue',
    category: 'LOCAL ISSUE CLI / TUI',
    status: 'Public',
    statusDetail: 'crates.io v0.2.0',
    tagline: 'Local issue management for Git repositories and AI agents.',
    summary:
      'A Rust CLI tool for keeping issue tracking close to your code. Humans work through a terminal UI, while AI agents use structured commands and JSON output.',
    repositoryUrl: 'https://github.com/Morishita-mm/Lissue',
    primaryLink: {
      label: 'View on crates.io',
      href: 'https://crates.io/crates/lissue',
    },
    visual: 'lissue',
    image: {
      src: '/projects/lissue-tui.webp',
      alt: 'Lissue terminal interface showing tasks and related files',
      caption: 'Captured from an actual demo session of the TUI',
    },
    architecture: {
      src: '/projects/architecture/lissue-en.svg',
      alt: 'Architecture diagram showing Lissue CLI, TUI, application core, SQLite, JSON files, and Git workflow',
    },
    languages: ['Rust'],
    stack: ['Rust', 'Ratatui', 'SQLite', 'JSON'],
    facts: [
      { label: 'Install', value: 'cargo install lissue' },
      { label: 'Release', value: 'v0.2.0' },
      { label: 'Tests', value: '41 tests passed' },
    ],
    challenge:
      'GitHub Issues is great, but it sits far from local code and autonomous agents. Conversely, a single shared TODO file often triggers Git merge conflicts during concurrent workflows.',
    answer:
      'Separated local state into SQLite and distributed synchronization into one-JSON-per-task files. Built both a human-friendly interactive TUI and machine-readable JSON commands on top of the same engine.',
    flow: [
      {
        label: 'INIT',
        title: 'Initialize',
        detail: 'Set up .lissue directory in repo root',
      },
      {
        label: 'CLAIM',
        title: 'Claim',
        detail: 'Assign task and update progress state',
      },
      {
        label: 'EDIT',
        title: 'Work',
        detail: 'Add context, notes, and file links',
      },
      {
        label: 'SYNC',
        title: 'Synchronize',
        detail: 'Export and sync task JSONs via Git',
      },
    ],
    decisions: [
      {
        title: 'Hybrid SQLite & JSON Architecture',
        detail:
          'Utilizes SQLite for instant local query speeds and individual task JSON files for clean Git merging across branches.',
      },
      {
        title: 'Native Ratatui Terminal Interface',
        detail:
          'Provides an ergonomic keyboard-driven terminal UI so developers never have to context-switch to a browser.',
      },
      {
        title: 'First-Class AI Agent Support',
        detail:
          'Every command includes a structured JSON output mode designed specifically for seamless consumption by LLM coding agents.',
      },
    ],
    evidence: [
      'Published on crates.io and verified across multiple OS environments',
      'Full test suite with 41 passing unit and integration tests',
      'Dogfooded daily as the primary task tracker for personal projects',
    ],
    now: 'The core functionality is rock-solid and actively used every day for managing personal development workflows.',
    next: [
      'Bidirectional sync bridge with GitHub Issues',
      'Multi-repository aggregation dashboard',
      'Custom metadata field extensions via plugins',
    ],
  },
  {
    slug: 'ragy',
    number: '03',
    name: 'Ragy',
    shortName: 'ragy',
    category: 'LOCAL RAG WORKSPACE',
    status: 'In daily use',
    statusDetail: 'CLI v0.2.1 / Workspace',
    tagline: 'Instant documentation retrieval without relying on external SaaS.',
    summary:
      'A local-first RAG tool combining vector embeddings and full-text keyword search to quickly answer queries across your private notes and codebases.',
    repositoryUrl: 'https://github.com/Morishita-mm/ragy',
    visual: 'ragy',
    architecture: {
      src: '/projects/architecture/ragy-en.svg',
      alt: 'Architecture diagram showing Ragy CLI, chunking pipeline, embeddings, local vector database, and retrieval flow',
    },
    languages: ['TypeScript', 'Python'],
    stack: ['TypeScript', 'Python', 'Ollama', 'Redis', 'Qdrant'],
    facts: [
      { label: 'Runtime', value: '100% Local Execution' },
      { label: 'Formats', value: 'Markdown & Code' },
      { label: 'Retrieval', value: 'Hybrid Search' },
    ],
    challenge:
      'Cloud-based knowledge bases are convenient, but uploading private codebases and confidential scratchpads poses real privacy risks, while network latency interrupts deep flow.',
    answer:
      'Engineered a complete local pipeline—embedding generation, vector indexing, and local LLM inference—ensuring total privacy with sub-second response times.',
    flow: [
      {
        label: 'CONNECT',
        title: 'Register',
        detail: 'Point to local directories or repositories',
      },
      {
        label: 'EXTRACT',
        title: 'Chunk',
        detail: 'Split code and prose into semantic chunks',
      },
      {
        label: 'VECTORIZE',
        title: 'Embed',
        detail: 'Generate embeddings using local models',
      },
      {
        label: 'QUERY',
        title: 'Retrieve',
        detail: 'Search and summarize with natural language',
      },
    ],
    decisions: [
      {
        title: 'Hybrid BM25 + Vector Retrieval',
        detail:
          'Combines exact keyword matches (for function and variable names) with semantic vector search for optimal recall and accuracy.',
      },
      {
        title: 'Incremental Hash-Based Re-indexing',
        detail:
          'Only recalculates embeddings for modified chunks upon file saves, avoiding costly and repetitive full-corpus passes.',
      },
      {
        title: 'Unix Pipeline Friendly CLI',
        detail:
          'Built with pipeable JSON and plaintext outputs to fit naturally into scripts and terminal workflows.',
      },
    ],
    evidence: [
      'Daily usage for engineering research and internal documentation search',
      'Consistently maintains sub-second query latency over extensive document collections',
      'Verified to operate flawlessly in fully air-gapped environments',
    ],
    now: 'Actively running as a reliable background service for searching project documentation and notes.',
    next: [
      'Extend support to PDF and office document formats',
      'Dynamic chunking optimization algorithms',
      'Local LAN sharing mode for small teams',
    ],
  },
  {
    slug: 'rust-log-analyzer',
    number: '04',
    name: 'Rust Log Analyzer',
    shortName: 'rust-log-analyzer',
    category: 'ASYNC LOG PROCESSOR / TUI',
    status: 'Technical prototype',
    statusDetail: 'Internal Prototype',
    tagline: 'Tackling heavy log streams with an asynchronous pipeline and responsive TUI.',
    summary:
      'An asynchronous stream-processing prototype designed to ingest, aggregate, and interactively filter high-volume log streams directly in the terminal.',
    repositoryUrl: 'https://github.com/Morishita-mm/rust-log-analyzer',
    visual: 'rust-log-analyzer',
    image: {
      src: '/projects/rust-log-analyzer.webp',
      alt: 'Terminal screen showing real-time log monitoring with Rust Log Analyzer',
      caption: 'Live interactive view of aggregated log metrics in the terminal',
    },
    architecture: {
      src: '/projects/architecture/rust-log-analyzer-en.svg',
      alt: 'Architecture diagram showing Vector ingestion, Redis stream, Python Polars analytics, and Rust Ratatui UI',
    },
    languages: ['Rust', 'Python'],
    stack: ['Rust', 'Python', 'Polars', 'Redis', 'Ratatui'],
    facts: [
      { label: 'Pipeline', value: 'Async Event Stream' },
      { label: 'Analytics', value: 'Polars (Python)' },
      { label: 'Interface', value: 'Ratatui (Rust)' },
    ],
    challenge:
      'Diagnosing live microservice logs often means waiting for sluggish web consoles or dealing with frozen terminals when attempting ad-hoc local aggregations.',
    answer:
      'Delegated asynchronous I/O and UI rendering to Rust while offloading intensive dataframe computations to Polars in Python, connected asynchronously through Redis.',
    flow: [
      {
        label: 'PRODUCE',
        title: 'Ingest',
        detail: 'Collect distributed logs via lightweight agents',
      },
      {
        label: 'ROUTE',
        title: 'Buffer',
        detail: 'Order and buffer events in Redis streams',
      },
      {
        label: 'AGGREGATE',
        title: 'Analyze',
        detail: 'Compute windowed aggregations with Polars',
      },
      {
        label: 'RENDER',
        title: 'Visualize',
        detail: 'Display live interactive charts in Ratatui',
      },
    ],
    decisions: [
      {
        title: 'Decoupled Visualization and Compute',
        detail:
          'Utilizes Rust for smooth 60fps terminal updates and Python Polars for efficient analytical queries.',
      },
      {
        title: 'Redis Event Bus Decoupling',
        detail:
          'Ensures producers, aggregators, and viewers remain loosely coupled without direct process dependencies.',
      },
      {
        title: 'Keyboard-First Investigation',
        detail:
          'Built with vim-style navigation, regex filtering, and OSC 52 clipboard copying for lightning-fast investigations.',
      },
    ],
    evidence: [
      'Docker Compose environment with live sample traffic producers',
      'Demonstrated stable multi-channel throughput without frame drops',
      'Clean separation of concerns verified across service boundaries',
    ],
    now: 'Functional prototype verifying the speed and ergonomics of asynchronous stream processing in the terminal.',
    next: [
      'Configurable dynamic Redis connection discovery',
      'Expanded automated test coverage for complex filter logic',
      'One-click multi-container deployment scripts',
    ],
  },
];

export function getProjectEn(slug: string) {
  return projectsEn.find((project) => project.slug === slug);
}
