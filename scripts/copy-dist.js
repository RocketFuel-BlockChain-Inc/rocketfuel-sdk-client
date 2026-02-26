const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'dist-qa');
const dest = path.join(__dirname, '..', '..', 'rocketfuel-netlify', 'dist');

if (!fs.existsSync(src)) {
  console.warn('copy-dist: dist-qa not found, skipping copy');
  process.exit(0);
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}
fs.mkdirSync(dest, { recursive: true });
for (const name of fs.readdirSync(src)) {
  const srcPath = path.join(src, name);
  const destPath = path.join(dest, name);
  if (fs.statSync(srcPath).isDirectory()) {
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}
console.log('copy-dist: copied dist-qa to ../rocketfuel-netlify/dist');
