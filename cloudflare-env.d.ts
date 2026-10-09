/// <reference types="@cloudflare/workers-types" />

// Both the existing classroom API and Battle 7 use the same D1 binding.
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}
