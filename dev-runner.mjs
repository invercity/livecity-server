import { spawn } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

const apiProc = spawn('npm', ['--workspace=@livecity/api', 'run', 'start'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' },
});

const webProc = spawn('npm', ['--workspace=@livecity/web', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env },
});

const shutdown = () => {
  apiProc.kill('SIGTERM');
  webProc.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
