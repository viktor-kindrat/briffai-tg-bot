const fs = require('node:fs');
const path = require('node:path');

const distDir = path.join(process.cwd(), 'dist');
const mainPath = path.join(distDir, 'main.js');

fs.mkdirSync(distDir, { recursive: true });

const content = `console.log('BriffAI bot build stub complete.');\n`;
fs.writeFileSync(mainPath, content, 'utf8');

console.log('Build completed.');
