const path = require('node:path');

const mainPath = path.join(process.cwd(), 'dist', 'main.js');

try {
  require(mainPath);
  console.log('BriffAI bot started (stub).');
} catch (error) {
  console.error('Failed to start stub:', error);
  process.exit(1);
}
