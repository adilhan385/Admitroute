import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Pin the upstream revision so builds use a reproducible snapshot.
const revision = '603e10f51b67c6553b9bca9aecc0db4c2417ed10';
const sourceBase = `https://raw.githubusercontent.com/Hipo/university-domains-list/${revision}`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function download(file) {
  const response = await fetch(`${sourceBase}/${file}`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  return response.text();
}

const [raw, license] = await Promise.all([
  download('world_universities_and_domains.json'),
  download('LICENSE.txt')
]);
const upstream = JSON.parse(raw);
if (!Array.isArray(upstream) || upstream.length < 10000) {
  throw new Error('Unexpected world university directory size.');
}

const records = upstream.map(item => {
  const websites = Array.isArray(item.web_pages) ? item.web_pages : [];
  const website = websites.find(url => typeof url === 'string' && /^https:\/\//i.test(url)) ||
    websites.find(url => typeof url === 'string' && /^http:\/\//i.test(url)) || '';
  return {
    name: String(item.name || '').trim(),
    country: String(item.country || '').trim(),
    countryCode: String(item.alpha_two_code || '').trim().toUpperCase(),
    stateProvince: typeof item['state-province'] === 'string' ? item['state-province'].trim() : '',
    domain: Array.isArray(item.domains) ? String(item.domains[0] || '').trim() : '',
    website
  };
}).filter(item => item.name && item.country);

await fs.writeFile(path.join(root, 'public/world-universities.json'),
  `${JSON.stringify(records)}\n`, 'utf8');
await fs.writeFile(path.join(root, 'src/data/HIPO_LICENSE.txt'), license, 'utf8');
await fs.writeFile(path.join(root, 'src/data/world-universities-source.json'),
  `${JSON.stringify({ source: 'Hipo/university-domains-list', revision,
    url: `https://github.com/Hipo/university-domains-list/tree/${revision}`,
    entries: records.length, license: 'MIT' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ entries: records.length,
  countries: new Set(records.map(item => item.countryCode)).size,
  missingWebsites: records.filter(item => !item.website).length }));
