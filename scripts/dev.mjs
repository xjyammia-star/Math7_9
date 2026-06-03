import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function start(command, args, name) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      process.kill(process.pid, 'SIGINT');
    }
  });

  return child;
}

const renderServer = start(process.execPath, [path.join(root, 'server', 'diagram-render-server.mjs')], 'diagram-render-server');
const viteDev = start(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port=3000', '--host=0.0.0.0'], 'vite');

function shutdown() {
  for (const child of [renderServer, viteDev]) {
    if (child && !child.killed) {
      child.kill('SIGINT');
    }
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
