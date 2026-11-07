import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "fs";
import { resolve, join } from "path";

const SITE_URL = "https://talantasportstickets.co.ke";
const EVENT_SLUG = "bayern-munich-vs-ajax";

const ROUTES = [
  { path: "/", priority: "1.00" },
  { path: `/events/${EVENT_SLUG}/seats`, priority: "0.95" },
  { path: "/about", priority: "0.80" },
  { path: "/faq", priority: "0.80" },
  { path: "/ticketing-terms", priority: "0.50" },
  { path: "/login", priority: "0.50" },
];

const REQUIRED_HEAD = [
  `<meta charset="UTF-8" />`,
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`,
  `<meta name="theme-color" content="#0e1116" />`,
];

const today = new Date().toISOString().split("T")[0];

const indexPath = resolve("dist/index.html");
if (!existsSync(indexPath)) {
  console.error("❌ dist/index.html not found");
  process.exit(1);
}

let html = readFileSync(indexPath, "utf-8");

// 1. Ensure required meta tags exist
const missing = REQUIRED_HEAD.filter((tag) => !html.includes(tag));
if (missing.length) {
  if (html.includes("<head>")) {
    html = html.replace("<head>", `<head>\n    ${missing.join("\n    ")}`);
    console.log(`✔ injected ${missing.length} required meta tag(s)`);
  } else {
    console.warn("⚠ no <head> found — cannot inject required meta tags");
  }
} else {
  console.log("✔ required meta tags already present");
}

// 2. Strip unwanted tags
html = html.replace(/<meta name="author" content="[^"]*"\s*\/?>\s*\n?/gi, "");
html = html.replace(/<meta name="keywords" content="[^"]*"\s*\/?>\s*\n?/gi, "");
html = html.replace(/<meta property="og:[^"]*"[^>]*>\s*\n?/gi, "");
html = html.replace(/<meta name="twitter:[^"]*"[^>]*>\s*\n?/gi, "");

// 3. Add fresh OG/Twitter block
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

html = html.replace("</head>", ogBlock + "</head>");

// 4. Deduplicate identical <script src>, <link rel>, and <meta name/property> tags
const dedupe = (source) => {
  const seen = new Set();
  return source
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;

      const scriptMatch = trimmed.match(/<script[^>]*\bsrc="([^"]+)"/i);
      const linkMatch = trimmed.match(/<link[^>]*\brel="([^"]+)"[^>]*\bhref="([^"]+)"/i);
      const metaMatch = trimmed.match(/<meta[^>]*\b(name|property)="([^"]+)"/i);

      let key = null;
      if (scriptMatch) key = `script:${scriptMatch[1]}`;
      else if (linkMatch) key = `link:${linkMatch[1]}:${linkMatch[2]}`;
      else if (metaMatch) key = `meta:${metaMatch[2]}`;

      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
};

html = dedupe(html);
html = html.replace(/\n{3,}/g, "\n\n");
console.log("✅ duplicates removed");

writeFileSync(indexPath, html, "utf-8");
console.log("✅ dist/index.html cleaned");

// 5. Walk sub-routes — inject required tags + strip unwanted
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry === "index.html" && full !== indexPath) {
      let sub = readFileSync(full, "utf-8");

      const subMissing = REQUIRED_HEAD.filter((tag) => !sub.includes(tag));
      if (subMissing.length && sub.includes("<head>")) {
        sub = sub.replace("<head>", `<head>\n    ${subMissing.join("\n    ")}`);
      }

      sub = sub.replace(/<meta name="author" content="[^"]*"\s*\/?>\s*\n?/gi, "");
      sub = sub.replace(/<meta name="keywords" content="[^"]*"\s*\/?>\s*\n?/gi, "");
      sub = dedupe(sub);

      writeFileSync(full, sub, "utf-8");
    }
  }
}
walk(resolve("dist"));

// 6. Write sitemap
const urls = ROUTES.map(
  (r) => `    <url>
        <loc>${SITE_URL}${r.path}</loc>
        <lastmod>${today}</lastmod>
        <priority>${r.priority}</priority>
    </url>`
).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(resolve("dist/sitemap.xml"), sitemap, "utf-8");
console.log(`✅ dist/sitemap.xml written (${ROUTES.length} URLs)`);