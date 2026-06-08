import { exec } from 'child_process';
import { promisify } from 'util';
import * as net from 'net';
import * as path from 'path';

const execAsync = promisify(exec);

function waitForPort(port: number, label: string, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const attempt = () => {
      const conn = net.connect(port, '127.0.0.1', () => {
        conn.destroy();
        resolve();
      });
      conn.on('error', () => {
        if (Date.now() >= deadline) {
          reject(new Error(`${label} is not reachable on :${port} — start it before running tests`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

export default async function globalSetup() {
  console.log('\n[e2e] Checking servers…');

  await waitForPort(3000, 'Frontend (Next.js)');
  console.log('[e2e] ✓ Frontend :3000');

  await waitForPort(4000, 'Backend (Express)');
  console.log('[e2e] ✓ Backend  :4000');

  console.log('[e2e] Seeding database…');

  const rootDir    = path.join(__dirname, '..');
  const backendDir = path.join(rootDir, 'backend');

  // Try yarn workspace first, then fall back to npx / direct binary
  const nodeBin = path.join(
    process.env.HOME ?? '',
    '.local',
    'nvm-node-20.14.0-darwin-arm64',
    'bin',
  );
  const extendedPath = `${nodeBin}:${process.env.PATH ?? ''}`;

  const attempts: Array<{ cmd: string; cwd: string }> = [
    { cmd: 'yarn workspace backend prisma db seed', cwd: rootDir },
    { cmd: 'npx prisma db seed',                   cwd: backendDir },
    { cmd: 'node_modules/.bin/prisma db seed',      cwd: backendDir },
  ];

  let seeded = false;
  for (const { cmd, cwd } of attempts) {
    try {
      const { stdout } = await execAsync(cmd, {
        cwd,
        env: { ...process.env, PATH: extendedPath },
      });
      if (stdout) process.stdout.write(stdout);
      seeded = true;
      break;
    } catch { /* try next */ }
  }

  if (!seeded) throw new Error('[e2e] Database seed failed — check backend logs');
  console.log('[e2e] ✓ Database seeded\n');
}
