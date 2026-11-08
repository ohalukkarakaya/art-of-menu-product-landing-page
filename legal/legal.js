/* Public legal pages on static artofmenu.com. No cookies or tracking. */
const root = document.querySelector('#legal-root')
const languages = { tr: 'Türkçe', en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', it: 'Italiano' }
const keys = ['business-terms', 'dpa', 'partner-terms', 'privacy-business', 'privacy-partner', 'privacy-guest', 'cookies', 'company']
const guests = new Set(['privacy-guest', 'cookies', 'company'])
const ui = {
  tr: { legal: 'Yasal bilgiler', home: 'Ana sayfa', versions: 'Sürüm', effective: 'Yürürlük', back: 'Belgelere dön', intro: 'Art of Menu yasal belgeleri', missing: 'Bu belge bulunamadı.', failed: 'Belgeler yüklenemedi. Sayfayı yeniden deneyin.', annex: 'Bağlayıcı ekler', guest: 'Misafir bilgilendirmesi', print: 'Yazdır', controller: 'Misafir verilerinin veri sorumlusu menüyü sunan işletmedir.' },
  en: { legal: 'Legal information', home: 'Home', versions: 'Version', effective: 'Effective', back: 'All documents', intro: 'Art of Menu legal documents', missing: 'Document not found.', failed: 'Unable to load legal documents. Please retry.', annex: 'Binding annexes', guest: 'Guest information', print: 'Print', controller: 'The restaurant providing the menu is the controller of guest data.' },
  de: { legal: 'Rechtliche Angaben', home: 'Startseite', versions: 'Version', effective: 'Gültig ab', back: 'Alle Dokumente', intro: 'Rechtliche Dokumente von Art of Menu', missing: 'Dokument nicht gefunden.', failed: 'Dokumente konnten nicht geladen werden.', annex: 'Verbindliche Anlagen', guest: 'Informationen für Gäste', print: 'Drucken', controller: 'Der das Menü anbietende Betrieb ist Verantwortlicher für die Gästedaten.' },
  es: { legal: 'Información legal', home: 'Inicio', versions: 'Versión', effective: 'Vigente desde', back: 'Todos los documentos', intro: 'Documentos legales de Art of Menu', missing: 'Documento no encontrado.', failed: 'No se pudieron cargar los documentos.', annex: 'Anexos vinculantes', guest: 'Información para clientes', print: 'Imprimir', controller: 'El establecimiento que facilita el menú es responsable de los datos de sus clientes.' },
  fr: { legal: 'Informations légales', home: 'Accueil', versions: 'Version', effective: 'Entrée en vigueur', back: 'Tous les documents', intro: 'Documents juridiques Art of Menu', missing: 'Document introuvable.', failed: 'Chargement des documents impossible.', annex: 'Annexes contractuelles', guest: 'Informations pour les clients', print: 'Imprimer', controller: 'L’établissement proposant le menu est responsable des données des clients.' },
  it: { legal: 'Informazioni legali', home: 'Home', versions: 'Versione', effective: 'In vigore dal', back: 'Tutti i documenti', intro: 'Documenti legali Art of Menu', missing: 'Documento non trovato.', failed: 'Impossibile caricare i documenti.', annex: 'Allegati vincolanti', guest: 'Informazioni per gli ospiti', print: 'Stampa', controller: 'Il locale che mette a disposizione il menu è titolare del trattamento dei dati degli ospiti.' }
}
const query = new URLSearchParams(location.search)
const browserLang = navigator.language.toLowerCase().split('-')[0]
const lang = languages[query.get('lang')] ? query.get('lang') : (languages[browserLang] ? browserLang : 'en')
const l = ui[lang]
const fromMenu = query.get('from') === 'menu'
const requested = root.dataset.defaultKey || ''
document.documentElement.lang = lang

function el(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}
function urlFor(key = '', customLang = lang) {
  const params = new URLSearchParams()
  if (fromMenu) params.set('from', 'menu')
  if (query.get('t') && fromMenu) params.set('t', query.get('t'))
  params.set('lang', customLang)
  return '/legal/' + (key ? key + '/' : '') + '?' + params
}
function link(text, href, cls) {
  const a = el('a', cls, text)
  a.href = href
  return a
}
function inline(parent, raw) {
  const value = String(raw)
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let i = 0, m
  while ((m = re.exec(value))) {
    if (m.index > i) parent.append(document.createTextNode(value.slice(i, m.index)))
    if (m[1] !== undefined) parent.append(el('strong', '', m[1]))
    else {
      const destination = m[3]
      if (destination.startsWith('doc:')) {
        const key = destination.slice(4).split('#')[0]
        if (fromMenu && !guests.has(key)) parent.append(document.createTextNode(m[2]))
        else {
          const target = link(m[2], urlFor(key))
          if (destination.includes('#')) target.href += '#' + destination.split('#')[1]
          parent.append(target)
        }
      } else if (/^(https:\/\/|mailto:|#)/.test(destination)) parent.append(link(m[2], destination))
      else parent.append(document.createTextNode(m[2]))
    }
    i = re.lastIndex
  }
  if (i < value.length) parent.append(document.createTextNode(value.slice(i)))
}
function renderBlock(block) {
  if (typeof block.p === 'string') {
    const p = el('p'); inline(p, block.p); return p
  }
  if (Array.isArray(block.ul) || Array.isArray(block.ol)) {
    const ordered = Array.isArray(block.ol), list = el(ordered ? 'ol' : 'ul')
    for (const item of (ordered ? block.ol : block.ul)) {
      const li = el('li')
      if (typeof item === 'string') inline(li, item)
      else if (typeof item === 'object' && item !== null) {
        if (item.p) inline(li, item.p)
        else li.textContent = JSON.stringify(item)
      }
      list.append(li)
    }
    return list
  }
  if (block.table) {
    const wrap = el('div', 'table-scroll'), table = el('table')
    if (block.table.head) {
      const tr = el('tr')
      for (const name of block.table.head) tr.append(el('th', '', name))
      const thead = el('thead'); thead.append(tr); table.append(thead)
    }
    const tbody = el('tbody')
    for (const values of block.table.rows || []) {
      const tr = el('tr')
      for (const value of values) {
        const td = el('td'); inline(td, value); tr.append(td)
      }
      tbody.append(tr)
    }
    table.append(tbody); wrap.append(table); return wrap
  }
  return document.createDocumentFragment()
}
async function getJson(path) {
  const r = await fetch(path)
  if (!r.ok) throw Error('Missing legal data at ' + path)
  return r.json()
}
async function show() {
  root.append(el('div', 'loading', '…'))
  try {
    const manifest = await getJson('/legal/data/manifest.json')
    root.replaceChildren()
    const header = el('header', 'legal-top')
    const headerInner = el('div', 'legal-top-inner')
    const logo = link('Art of Menu', '/', 'legal-logo')
    const tools = el('div', 'legal-tools')
    const select = el('select')
    select.setAttribute('aria-label', 'Language')
    for (const [code, name] of Object.entries(languages)) {
      const option = el('option', '', name); option.value = code; option.selected = code === lang; select.append(option)
    }
    select.addEventListener('change', () => { location.href = urlFor(requested, select.value) })
    tools.append(select)
    tools.append(link(l.home, '/', 'legal-home'))
    headerInner.append(logo, tools); header.append(headerInner); root.append(header)

    const main = el('main', 'legal-main')
    const back = link(l.back, urlFor(), 'legal-back')
    main.append(back)

    if (!requested) {
      main.append(el('p', 'eyebrow', 'ART OF MENU'), el('h1', '', l.intro))
      const list = el('div', 'legal-list')
      for (const key of keys) {
        if (fromMenu && !guests.has(key)) continue
        if (!manifest[key]) continue
        const item = link(manifest[key].titles[lang] || manifest[key].titles.en, urlFor(key), 'legal-card')
        item.append(el('span', 'chevron', '›'))
        list.append(item)
      }
      main.append(list)
    } else if (!manifest[requested] || (fromMenu && !guests.has(requested))) {
      main.append(el('h1', '', l.missing))
    } else {
      const doc = await getJson('/legal/data/' + requested + '/' + lang + '.json')
      document.title = doc.title + ' · Art of Menu'
      main.append(el('p', 'eyebrow', 'ART OF MENU'), el('h1', '', doc.title))
      main.append(el('p', 'legal-meta', l.versions + ' ' + doc.version + ' · ' + l.effective + ' ' + doc.effective))
      if (doc.summary) main.append(el('p', 'legal-summary', doc.summary))
      if (fromMenu && requested === 'privacy-guest') main.append(el('p', 'legal-context', l.controller))
      const contents = el('nav', 'legal-toc')
      for (const section of doc.sections) {
        const item = link(section.heading, '#' + section.id)
        contents.append(item)
      }
      main.append(contents)
      const article = el('article', 'legal-article')
      for (const section of doc.sections) {
        const block = el('section')
        block.id = section.id
        block.append(el('h2', '', section.heading))
        for (const b of section.blocks || []) block.append(renderBlock(b))
        article.append(block)
      }
      if (Array.isArray(doc.annexes) && doc.annexes.length) {
        const sec = el('section'); sec.append(el('h2', '', l.annex))
        for (const k of doc.annexes) if (!fromMenu || guests.has(k)) {
          const p = el('p')
          p.append(link(manifest[k]?.titles[lang] || k, urlFor(k)))
          sec.append(p)
        }
        article.append(sec)
      }
      main.append(article)
      const print = el('button', 'legal-print', l.print)
      print.addEventListener('click', () => window.print())
      main.append(print)
    }
    const foot = el('footer', 'legal-footer')
    foot.append(el('span', '', '© 2026 Art of Menu · Göktigin Bilişim Teknoloji Ltd. Şti.'), link(l.legal, urlFor()))
    root.append(main, foot)
  } catch (err) {
    console.error('Legal page could not load', err)
    root.replaceChildren(el('main', 'legal-main', l.failed))
  }
}
show()
