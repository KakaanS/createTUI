#!/usr/bin/env node
// Downloads the ssh-cv binaries from the GitHub Releases `latest` tag into
// web/public/ before vite build, so the deployed site can serve them.
//
// Repo identification (first match wins):
//   1. $SSH_CV_REPO            — explicit override, e.g. "oscarwendt/tui-cv-builder"
//   2. $VERCEL_GIT_REPO_OWNER + $VERCEL_GIT_REPO_SLUG (Vercel)
//   3. $REPOSITORY_URL         — Netlify, parsed for owner/repo
//   4. package.json "repository.url"
//
// Local dev: files already present in web/public/ are skipped, so re-running
// the script is cheap. If you've built locally with `go build`, this script
// will not overwrite your local builds.

import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { pipeline } from "node:stream/promises"

const ASSETS = [
  "ssh-cv-linux-amd64",
  "ssh-cv-linux-arm64",
  "ssh-cv-macos-amd64",
  "ssh-cv-macos-arm64",
  "ssh-cv-windows-amd64.exe",
]

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = resolve(__dirname, "..", "public")

async function resolveRepo() {
  if (process.env.SSH_CV_REPO) return process.env.SSH_CV_REPO

  if (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG) {
    return `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
  }

  if (process.env.REPOSITORY_URL) {
    const m = process.env.REPOSITORY_URL.match(/github\.com[/:]([^/]+)\/([^/.]+?)(\.git)?$/)
    if (m) return `${m[1]}/${m[2]}`
  }

  try {
    const pkg = JSON.parse(await readFile(resolve(__dirname, "..", "package.json"), "utf8"))
    const url = pkg.repository?.url ?? pkg.repository
    if (typeof url === "string") {
      const m = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(\.git)?$/)
      if (m) return `${m[1]}/${m[2]}`
    }
  } catch {}

  return null
}

async function downloadOne(repo, asset) {
  const target = resolve(PUBLIC_DIR, asset)
  if (existsSync(target) && statSync(target).size > 100_000) {
    console.log(`  ✓ ${asset} (already present, ${statSync(target).size} bytes)`)
    return
  }

  const url = `https://github.com/${repo}/releases/download/latest/${asset}`
  process.stdout.write(`  ↓ ${asset} ... `)

  const res = await fetch(url, { redirect: "follow" })
  if (!res.ok || !res.body) {
    if (existsSync(target)) unlinkSync(target)
    throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`)
  }

  await pipeline(res.body, createWriteStream(target))
  console.log(`${statSync(target).size} bytes`)
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true })

  const missing = ASSETS.filter((asset) => {
    const path = resolve(PUBLIC_DIR, asset)
    return !existsSync(path) || statSync(path).size <= 100_000
  })

  if (missing.length === 0) {
    console.log("fetch-binaries: all binaries already present, nothing to do.")
    return
  }

  const repo = await resolveRepo()
  if (!repo) {
    console.error(
      `fetch-binaries: ${missing.length} binary(ies) missing and no GitHub repo configured.\n` +
        "  Either:\n" +
        "    - build them locally: cd template && go build ... (see README)\n" +
        "    - or set SSH_CV_REPO=owner/name to fetch from GitHub Releases\n" +
        "    - or add a `repository.url` field to web/package.json",
    )
    process.exit(1)
  }

  console.log(`fetch-binaries: source = github.com/${repo} (tag: latest)`)
  for (const asset of missing) {
    try {
      await downloadOne(repo, asset)
    } catch (err) {
      console.error(`  ✗ ${asset}: ${err.message}`)
      process.exit(1)
    }
  }
  console.log("fetch-binaries: done.")
}

main()
