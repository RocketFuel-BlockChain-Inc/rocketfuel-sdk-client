const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const archiver = require('archiver');

const pluginName = 'rocketfuel-wp-plugin';
const distFilePattern = /^rkfl-transact-client\.min-[\d.]+\.js$/;
const buildDir = path.join(__dirname, 'build');
const distDir = path.join(__dirname, 'dist');
const outputZip = path.join(__dirname, `${pluginName}.zip`);

// Step 1: Ensure build directory is clean
if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
fs.mkdirSync(buildDir);
fs.mkdirSync(path.join(buildDir, 'dist'));

// Step 2: Copy plugin PHP file
fs.copyFileSync('rocketfuel-plugin.php', path.join(buildDir, 'rocketfuel-plugin.php'));

// Step 3: Copy the latest SDK file
const distFiles = fs.readdirSync(distDir);
const sdkFile = distFiles.find(file => distFilePattern.test(file));
if (!sdkFile) {
  console.error('❌ No matching SDK file found in dist/');
  process.exit(1);
}
fs.copyFileSync(
  path.join(distDir, sdkFile),
  path.join(buildDir, 'dist', sdkFile)
);

// Step 4: Create zip
const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Build complete. Created: ${outputZip} (${archive.pointer()} bytes)`);
});

archive.on('error', err => { throw err; });

archive.pipe(output);
archive.directory(buildDir, pluginName);
archive.finalize();
