const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('       ENTERPRISE CRM SYSTEM FOR SMALL BUSINESSES');
console.log('                 Concurrent Development Runner');
console.log('================================================================');
console.log(' Starting Backend Server on http://localhost:5000...');
console.log(' Starting Frontend Client on http://localhost:3000...');
console.log('================================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;

// Start Backend process
const backend = spawn(nodeCmd, ['backend/src/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000', NODE_ENV: 'development' }
});

// Start Frontend process
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env }
});

const cleanup = () => {
  console.log('\n[Orchestrator] Shutting down CRM services gracefully...');
  try {
    backend.kill();
    frontend.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
