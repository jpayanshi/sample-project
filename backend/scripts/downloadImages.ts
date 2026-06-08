/**
 * Downloads product images from picsum.photos (free, no API key, stable seeded URLs).
 * Note: source.unsplash.com was shut down June 2024 — picsum.photos is the drop-in
 * replacement with the same redirect-to-CDN pattern and no rate limiting for dev use.
 *
 * Usage:  yarn download:images
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Resolve paths relative to this script, not the cwd
const FRONTEND_PUBLIC = path.join(__dirname, '..', '..', 'frontend', 'public');
const IMAGES_ROOT = path.join(FRONTEND_PUBLIC, 'images', 'products');

// ─── Image plan ───────────────────────────────────────────────────────────────
// seeds are stable strings → picsum.photos/seed/<seed>/600/800 always returns
// the same photo, making repeated runs idempotent.

interface ImageGroup {
  folder: string;
  prefix: string;
  seeds: string[];
}

const IMAGE_PLAN: ImageGroup[] = [
  {
    folder: 'tshirts',
    prefix: 'tshirt',
    // 5 seeds — one per T-Shirt product in the seed file
    seeds: [
      'apparel-tshirt-01',
      'apparel-tshirt-02',
      'apparel-tshirt-03',
      'apparel-tshirt-04',
      'apparel-tshirt-05',
    ],
  },
  {
    folder: 'hoodies',
    prefix: 'hoodie',
    seeds: [
      'apparel-hoodie-01',
      'apparel-hoodie-02',
      'apparel-hoodie-03',
      'apparel-hoodie-04',
    ],
  },
  {
    folder: 'trousers',
    prefix: 'trouser',
    seeds: [
      'apparel-trouser-01',
      'apparel-trouser-02',
      'apparel-trouser-03',
      'apparel-trouser-04',
    ],
  },
  {
    folder: 'jackets',
    prefix: 'jacket',
    seeds: [
      'apparel-jacket-01',
      'apparel-jacket-02',
      'apparel-jacket-03',
      'apparel-jacket-04',
    ],
  },
  {
    folder: 'accessories',
    prefix: 'accessory',
    // 3 seeds — one per Accessories product
    seeds: [
      'apparel-accessory-01',
      'apparel-accessory-02',
      'apparel-accessory-03',
    ],
  },
];

// ─── Download helper ──────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function downloadToFile(url: string, dest: string, hops = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (hops > 10) {
      reject(new Error('Too many redirects'));
      return;
    }

    const mod = url.startsWith('https') ? https : http;

    const req = mod.get(
      url,
      { headers: { 'User-Agent': 'clothing-store-dev/1.0' } },
      (res) => {
        // Follow 3xx redirects (picsum → fastly CDN, placehold.co → image)
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
          const location = res.headers.location ?? '';
          res.resume(); // drain so socket is reusable
          const next = location.startsWith('http')
            ? location
            : new URL(location, url).href;
          resolve(downloadToFile(next, dest, hops + 1));
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
          return;
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
        file.on('error', (err) => {
          fs.unlink(dest, () => {}); // clean up partial file
          reject(err);
        });
      },
    );

    req.setTimeout(20_000, () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🖼  Downloading product images…\n');

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const group of IMAGE_PLAN) {
    const dir = path.join(IMAGES_ROOT, group.folder);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`📁  ${group.folder}/`);

    for (let i = 0; i < group.seeds.length; i++) {
      const filename = `${group.prefix}-${i + 1}.jpg`;
      const dest = path.join(dir, filename);
      const url = `https://picsum.photos/seed/${group.seeds[i]}/600/800`;

      if (fs.existsSync(dest)) {
        console.log(`     ⏭  ${filename} already exists — skipping`);
        skipped++;
        continue;
      }

      process.stdout.write(`     ⬇  Downloading ${filename}…`);
      try {
        await downloadToFile(url, dest);
        process.stdout.write(' ✓\n');
        downloaded++;
      } catch (err) {
        process.stdout.write(` ⚠  failed: ${(err as Error).message}\n`);
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        failed++;
      }

      await delay(300);
    }

    console.log('');
  }

  // ── Placeholder fallback image ─────────────────────────────────────────────
  const placeholderDir = path.join(FRONTEND_PUBLIC, 'images');
  fs.mkdirSync(placeholderDir, { recursive: true });
  const placeholderDest = path.join(placeholderDir, 'placeholder.jpg');

  if (fs.existsSync(placeholderDest)) {
    console.log('  ⏭  placeholder.jpg already exists — skipping');
    skipped++;
  } else {
    process.stdout.write('  ⬇  Downloading placeholder.jpg…');
    try {
      // placehold.co generates a real JPEG — light grey bg, mid-grey text
      await downloadToFile(
        'https://placehold.co/600x800/e5e7eb/9ca3af.jpg',
        placeholderDest,
      );
      process.stdout.write(' ✓\n');
      downloaded++;
    } catch (err) {
      process.stdout.write(` ⚠  failed: ${(err as Error).message}\n`);
      failed++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const rel = path.relative(
    path.join(__dirname, '..', '..'),
    IMAGES_ROOT,
  );
  console.log(`\n✅  Downloaded ${downloaded} image${downloaded !== 1 ? 's' : ''} → ${rel}/`);
  if (skipped > 0) console.log(`   ${skipped} already existed and were skipped`);
  if (failed > 0)  console.log(`   ⚠  ${failed} failed — run again to retry`);
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
