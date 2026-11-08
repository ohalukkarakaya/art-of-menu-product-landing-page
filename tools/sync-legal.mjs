#!/usr/bin/env node
// Publish the backend's *current, immutable* legal texts on the static
// artofmenu.com site (GitHub Pages has no /api/v1/legal endpoint).
// Run whenever legal/current.json changes: node tools/sync-legal.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const legalRoot = path.resolve(site, '../art-of-menu-backend/legal')
const target = path.join(site, 'legal')
const langs = ['tr', 'en', 'de', 'es', 'fr', 'it']
const current = JSON.parse(fs.readFileSync(path.join(legalRoot, 'current.json'), 'utf8'))
const keys = Object.keys(current)
const names = new Set(['company', 'business-terms', 'dpa', 'corporate-policy', 'partner-terms', 'privacy-business', 'privacy-partner', 'privacy-guest', 'cookies'])
if (keys.length !== names.size || keys.some(k => !names.has(k))) throw Error('Unexpected legal document inventory')

fs.mkdirSync(path.join(target, 'data'), { recursive: true })
const manifest = {}
for (const key of keys) {
  const version = current[key].version
  manifest[key] = { version, titles: {} }
  fs.mkdirSync(path.join(target, 'data', key), { recursive: true })
  for (const lang of langs) {
    const original = path.join(legalRoot, key, version, lang + '.json')
    const raw = fs.readFileSync(original)
    const doc = JSON.parse(raw)
    if (doc.key !== key || doc.locale !== lang || doc.version !== version) throw Error('Wrong document version: ' + original)
    manifest[key].titles[lang] = doc.title
    fs.writeFileSync(path.join(target, 'data', key, lang + '.json'), raw)
  }
}
fs.writeFileSync(path.join(target, 'data', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
const page = (key = '') => `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta name="description" content="Art of Menu — şirket bilgileri, sözleşmeler ve gizlilik bildirimleri.">
  <title>Yasal Bilgiler · Art of Menu</title>
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="stylesheet" href="/legal/legal.css">
  <script type="module" src="/legal/legal.js"></script>
</head>
<body>
  <div id="legal-root" data-default-key="${key}"></div>
  <noscript>Bu sayfa belgeleri göstermek için JavaScript gerektirir. İletişim: hello@goktigin.com.</noscript>
</body>
</html>
`
fs.writeFileSync(path.join(target, 'index.html'), page())
for (const key of keys) {
  fs.mkdirSync(path.join(target, key), { recursive: true })
  fs.writeFileSync(path.join(target, key, 'index.html'), page(key))
}
console.log(`Static legal mirror ready: ${keys.length} documents x ${langs.length} languages. Do not publish without reviewing terms.`)
