import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const certsDir = path.join(projectRoot, 'certs');

console.log('🔐 Setting up HTTPS certificates with mkcert...\n');

// Find mkcert executable
let mkcertCmd = 'mkcert';
const possibleMkcertPaths = [
  path.join(projectRoot, 'mkcert-v1.4.4-windows-amd64.exe'),
  path.join(projectRoot, 'mkcert.exe'),
  path.join(projectRoot, 'mkcert-v1.4.4-windows-amd64'),
];

// Check for local mkcert executable first
for (const mkcertPath of possibleMkcertPaths) {
  if (fs.existsSync(mkcertPath)) {
    mkcertCmd = mkcertPath;
    console.log(`✅ Found mkcert at: ${mkcertPath}\n`);
    break;
  }
}

// Check if mkcert works (either local or in PATH)
try {
  execSync(`"${mkcertCmd}" -version`, { stdio: 'ignore' });
} catch (error) {
  console.error('❌ mkcert is not working!');
  console.error(`   Tried: ${mkcertCmd}`);
  console.error('\nPlease ensure mkcert is available:');
  console.error('  1. Place mkcert.exe in the project root, or');
  console.error('  2. Install mkcert globally (choco install mkcert)');
  process.exit(1);
}

// Install local CA if not already installed
console.log('📦 Installing local Certificate Authority...');
try {
  execSync(`"${mkcertCmd}" -install`, { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️  mkcert -install may have failed, but continuing...');
}

// Create certs directory
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('✅ Created certs directory');
}

// Generate certificates
console.log('\n🔑 Generating certificates for localhost, 127.0.0.1, and 192.168.1.145...');
try {
  execSync(
    `"${mkcertCmd}" -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 192.168.1.145 ::1`,
    { cwd: projectRoot, stdio: 'inherit' }
  );
  console.log('\n✅ Certificates generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your servers (stop and start again)');
  console.log('   2. Access via: https://192.168.1.145:3000');
  console.log('   3. Clipboard copy will now work over the network!');
} catch (error) {
  console.error('\n❌ Failed to generate certificates');
  console.error('Make sure mkcert is installed and try again.');
  process.exit(1);
}
