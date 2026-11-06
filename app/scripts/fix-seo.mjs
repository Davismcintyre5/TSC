import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SITE_URL = 'https://talantasportstickets.co.ke';
const EVENT_SLUG = 'bayern-munich-vs-ajax';

const ROUTES = [
  { path: '/', priority: '1.00' },
  { path: `/events/${EVENT_SLUG}/seats`, priority: '0.95' },
  { path: '/about', priority: '0.80' },
  { path: '/faq', priority: '0.80' },
  { path: '/ticketing-terms', priority: '0.50' },
  { path: '/login', priority: '0.50' },
];

const today = new Date().toISOString().split('T')[0];

const indexPath = resolve('dist/index.html');
if (!existsSync(indexPath)) {
  console.error('❌ dist/index.html not found');
  process.exit(1);
}

let html = readFileSync(indexPath, 'utf-8');

html = html.replace(/<meta name="author" content="[^"]*"\s*\/?>\s*\n?/gi, '');
html = html.replace(/<meta name="keywords" content="[^"]*"\s*\/?>\s*\n?/gi, '');
html = html.replace(/<meta property="og:[^"]*"[^>]*>\s*\n?/gi, '');
html = html.replace(/<meta name="twitter:[^"]*"[^>]*>\s*\n?/gi, '');
html = html.replace(/\n{3,}/g, '\n\n');

const ogBlock = `
    <meta property="og:title" content="Bayern Munich vs Ajax — 5 January 2027 | Talanta Sports City" />
    <meta property="og:description" content="Buy tickets for Bayern Munich vs Ajax at Talanta Sports City in Nairobi on 5 January 2027." />
    <meta property="og:image" content="https://talantasportstickets.co.ke/og-image.png" />
    <meta property="og:url" content="https://talantasportstickets.co.ke/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Talanta Sports Tickets" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Bayern Munich vs Ajax — 5 January 2027 | Talanta Sports City" />
    <meta name="twitter:description" content="Buy tickets for Bayern Munich vs Ajax at Talanta Sports City in Nairobi." />
    <meta name="twitter:image" content="https://talantasportstickets.co.ke/og-image.png" />
`;

html = html.replace('</head>', ogBlock + '</head>');
writeFileSync(indexPath, html, 'utf-8');
console.log('✅ dist/index.html cleaned');

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry === 'index.html' && full !== indexPath) {
      let sub = readFileSync(full, 'utf-8');
      sub = sub.replace(/<meta name="author" content="[^"]*"\s*\/?>\s*\n?/gi, '');
      sub = sub.replace(/<meta name="keywords" content="[^"]*"\s*\/?>\s*\n?/gi, '');
      writeFileSync(full, sub, 'utf-8');
    }
  }
}
walk(resolve('dist'));

const urls = ROUTES.map(
  (r) => `    <url>
        <loc>${SITE_URL}${r.path}</loc>
        <lastmod>${today}</lastmod>
        <priority>${r.priority}</priority>
    </url>`
).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(resolve('dist/sitemap.xml'), sitemap, 'utf-8');
console.log(`✅ dist/sitemap.xml written (${ROUTES.length} URLs)`);