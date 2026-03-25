import { writeFile } from 'node:fs/promises'

const SITE_URL = (process.env.SITE_URL ?? 'https://example.com').replace(/\/+$/, '')
const languages = ['en', 'fa', 'ps', 'uz']
const paths = ['/', '/about', '/services', '/platform', '/news', '/partners', '/contact']

const urls = languages.flatMap((language) =>
  paths.map((path) => `${SITE_URL}/${language}${path === '/' ? '/' : path}`),
)

const body = urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8')
console.log(`Sitemap generated for ${SITE_URL}`)
