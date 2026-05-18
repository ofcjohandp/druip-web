#!/usr/bin/env node
// One-time script to apply migration 00024 (ratings.comment + payout_requests)
// to the production Supabase project using the service role key from .env.local.
//
// Usage:
//   node scripts/apply-migration-00024.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
//
// The Supabase REST API does not allow arbitrary DDL; this script uses the
// pg_meta query endpoint exposed by `supabase-js` via `rpc`. If that is not
// available on your project, run the SQL in supabase/migrations/00024_ratings_comment_and_payouts.sql
// via the Supabase Dashboard SQL Editor.

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error(`Missing .env.local at ${envPath}`)
    process.exit(1)
  }
  const text = fs.readFileSync(envPath, 'utf8')
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

const env = loadEnvLocal()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sqlPath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '00024_ratings_comment_and_payouts.sql')
if (!fs.existsSync(sqlPath)) {
  console.error(`Migration file not found: ${sqlPath}`)
  process.exit(1)
}
const sql = fs.readFileSync(sqlPath, 'utf8')

// Supabase provides `query` endpoint under pg-meta at /pg-meta/default/query
// when self-hosted, but on hosted Supabase you need to use the SQL editor or
// the postgres-meta REST endpoint at /database/query (admin API).
//
// The most portable approach is the `/rest/v1/rpc/<name>` endpoint when an
// `exec_sql` function is defined. Many Supabase projects do NOT have that
// function. Below we try the SQL endpoint and fall back to printing the SQL
// for manual application.

async function tryPgMetaQuery() {
  const res = await fetch(`${SUPABASE_URL}/pg-meta/default/query`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  return res
}

async function main() {
  console.log(`Applying migration to ${SUPABASE_URL}`)
  const res = await tryPgMetaQuery()
  const text = await res.text()
  if (res.ok) {
    console.log('OK — migration applied.')
    console.log(text)
    return
  }
  console.error(`Status ${res.status} — could not apply via pg-meta endpoint.`)
  console.error(text.slice(0, 500))
  console.error('\nFallback: open the Supabase SQL Editor and paste:')
  console.error('  ' + sqlPath)
  process.exitCode = 2
}

main().catch(err => { console.error(err); process.exit(1) })
