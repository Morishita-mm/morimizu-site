declare namespace Cloudflare {
  interface Env {
    JOURNAL_DB: D1Database;
    JOURNAL_UPLOAD_TOKEN?: string;
    JOURNAL_ACCESS_TEAM?: string;
    JOURNAL_ACCESS_AUD?: string;
    JOURNAL_ADMIN_EMAIL?: string;
  }
}
