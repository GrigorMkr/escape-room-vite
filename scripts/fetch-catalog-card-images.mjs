import fs from 'fs';
import https from 'https';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const OUT_ROOT = path.join(PROJECT_ROOT, 'public', 'img', 'content');
const CDN = 'https://grading.design.htmlacademy.pro/static/quest';

const SLUGS = [
  'crypt',
  'maniac',
  'ritual',
  'ghosts',
  'palace',
  'hut',
  'experiment',
  'metro',
  'loft',
  'frontier',
  'mars',
];

function fetchBuffer(url, redirectDepth = 0) {
  return new Promise((resolve, reject) => {
    if (redirectDepth > 8) {
      reject(new Error('too many redirects'));
      return;
    }
    https
      .get(url, {headers: {'user-agent': 'escape-room-catalog-images/1'}}, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          const loc = res.headers.location;
          if (!loc) {
            reject(new Error('redirect without location'));
            return;
          }
          const next = new URL(loc, url).href;
          res.resume();
          void fetchBuffer(next, redirectDepth + 1).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function main() {
  for (const slug of SLUGS) {
    const dir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(dir, {recursive: true});

    const downloads =
      slug === 'maniac'
        ? [
            [`${CDN}/maniac-size-m.webp`, 'maniac-size-m.webp'],
            [`${CDN}/maniac-size-m@2x.webp`, 'maniac-size-m@2x.webp'],
            [`${CDN}/maniac-size-m.jpg`, 'maniac-size-m.jpg'],
            [`${CDN}/maniac-size-m@2x.jpg`, 'maniac-size-m@2x.jpg'],
          ]
        : [
            [`${CDN}/${slug}.webp`, `${slug}-size-m.webp`],
            [`${CDN}/${slug}@2x.webp`, `${slug}-size-m@2x.webp`],
            [`${CDN}/${slug}.jpg`, `${slug}-size-m.jpg`],
            [`${CDN}/${slug}@2x.jpg`, `${slug}-size-m@2x.jpg`],
          ];

    for (const [remote, filename] of downloads) {
      const dest = path.join(dir, filename);
      try {
        const buf = await fetchBuffer(remote);
        fs.writeFileSync(dest, buf);
        process.stdout.write(`OK ${slug}/${filename}\n`);
      } catch (err) {
        process.stderr.write(`FAIL ${slug}/${filename}: ${remote} (${err.message})\n`);
      }
    }
  }
}

void main();
