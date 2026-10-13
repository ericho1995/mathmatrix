#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Tells the IndexNow search engines (Bing, Yandex, Seznam, Naver and others)
// that every page in the live sitemap is new or changed, so they crawl it
// within hours instead of waiting to find it. Google does not take part in
// IndexNow; it reads the sitemap that robots.txt points to.
//
// The key is the file public/<32 hex>.txt, served at the site root: the
// engines fetch it to confirm the site owner sent the list.
//
//   node scripts/indexnow.mjs              submit now
//   node scripts/indexnow.mjs --wait       wait for the deploy first (CI)
//   node scripts/indexnow.mjs --dry-run    print what would be sent
//
// Run by .github/workflows/indexnow.yml on every push to main.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs'
import path from 'node:path'

const SITE = (process.env.SITE_URL ?? 'https://prepnest.com.au').replace(/\/$/, '')
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const wait = args.has('--wait')

const keyFile = fs.readdirSync(path.join(process.cwd(), 'public')).find(f => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) {
  console.error('No IndexNow key file (public/<32 hex characters>.txt).')
  process.exit(1)
}
const key = keyFile.replace(/\.txt$/, '')
const keyLocation = `${SITE}/${keyFile}`
const host = new URL(SITE).host

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'PrepNest-IndexNow/1.0' } })
  return { ok: res.ok, status: res.status, text: await res.text() }
}

/** Vercel deploys a push in a few minutes; the engines must be able to read the key when they check. */
async function waitForKey() {
  // A push to main has only just started deploying, so give it a head start.
  await sleep(4 * 60_000)
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const r = await fetchText(keyLocation)
      if (r.ok && r.text.trim() === key) return
      console.log(`Key not live yet (${r.status}), attempt ${attempt}`)
    } catch (error) {
      console.log(`Key not reachable yet (${error.message}), attempt ${attempt}`)
    }
    await sleep(30_000)
  }
  throw new Error(`The key file never appeared at ${keyLocation}`)
}

async function sitemapUrls() {
  const r = await fetchText(`${SITE}/sitemap.xml`)
  if (!r.ok) throw new Error(`sitemap.xml returned ${r.status}`)
  const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  const urls = [...r.text.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(m => decode(m[1]))
  // IndexNow refuses the whole batch if any URL is on another host.
  return [...new Set(urls)].filter(u => {
    try {
      return new URL(u).host === host
    } catch {
      return false
    }
  })
}

async function main() {
  if (wait) await waitForKey()
  const urls = await sitemapUrls()
  const llms = `${SITE}/llms.txt`
  const urlList = [...urls, llms].slice(0, 10_000)
  console.log(`${urlList.length} URLs for ${host}`)

  if (dryRun) {
    console.log(urlList.join('\n'))
    return
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  })
  const detail = await res.text()
  // 200: received. 202: received, key check pending. Anything else is a refusal.
  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow accepted the list (${res.status}).`)
    return
  }
  throw new Error(`IndexNow returned ${res.status}: ${detail.slice(0, 500)}`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
