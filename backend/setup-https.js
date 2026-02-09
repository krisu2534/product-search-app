import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

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

// Detect local network IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  
  return ips;
}

// Generate certificates
const localIPs = getLocalIPs();
const certDomains = ['localhost', '127.0.0.1', '::1', ...localIPs];

console.log('\n🔑 Generating certificates for:');
console.log('   - localhost, 127.0.0.1, ::1');
localIPs.forEach(ip => console.log(`   - ${ip}`));

try {
  const certCommand = `"${mkcertCmd}" -key-file certs/key.pem -cert-file certs/cert.pem ${certDomains.join(' ')}`;
  execSync(certCommand, { cwd: projectRoot, stdio: 'inherit' });
  
  console.log('\n✅ Certificates generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your servers (stop and start again)');
  if (localIPs.length > 0) {
    console.log(`   2. Access via: https://${localIPs[0]}:3000`);
  }
  console.log('   3. Clipboard copy will now work over the network!');
} catch (error) {
  console.error('\n❌ Failed to generate certificates');
  console.error('Make sure mkcert is installed and try again.');
  process.exit(1);
}
