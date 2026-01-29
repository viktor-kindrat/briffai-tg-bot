#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const args = process.argv.slice(2);
const command = args[0];

const runScript = (script) => {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  process.exit(result.status ?? 0);
};

if (command === 'build') {
  runScript('scripts/build.js');
} else if (command === 'start') {
  runScript('scripts/start.js');
} else {
  console.log('Nest CLI stub: supported commands are build and start.');
}
