# Setup HTTPS with mkcert for Network Access

This guide will help you set up HTTPS so clipboard copy works when accessing via `http://192.168.1.145:3000`

## Step 1: Install mkcert

**Windows (using Chocolatey):**
```powershell
choco install mkcert
```

**Windows (using Scoop):**
```powershell
scoop install mkcert
```

**Windows (Manual):**
1. Download from: https://github.com/FiloSottile/mkcert/releases
2. Download `mkcert-v1.x.x-windows-amd64.exe`
3. Rename to `mkcert.exe` and place in a folder in your PATH

**Mac:**
```bash
brew install mkcert
```

**Linux:**
```bash
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

## Step 2: Install Local CA

```powershell
mkcert -install
```

This installs a local Certificate Authority that your browser will trust.

## Step 3: Generate Certificates

Run these commands in your project root directory:

```powershell
# Create certs directory
mkdir certs

# Generate certificate for localhost and your network IP
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 192.168.1.145 ::1
```

This creates:
- `certs/key.pem` - Private key
- `certs/cert.pem` - Certificate

## Step 4: Update Server Configurations

The servers have been configured to use HTTPS. Just restart them after generating certificates.

## Step 5: Start Servers

Run `start-all-cmd.bat` or start servers manually. They will now use HTTPS.

## Step 6: Access via HTTPS

- Frontend: `https://192.168.1.145:3000`
- Backend API: `https://192.168.1.145:3001`

**Important:** Use `https://` not `http://` when accessing over the network!

## Troubleshooting

If you see certificate warnings:
1. Make sure `mkcert -install` ran successfully
2. Restart your browser
3. Try accessing `https://localhost:3000` first to verify certificates work

If clipboard still doesn't work:
1. Check browser console (F12) for errors
2. Make sure you're using `https://` not `http://`
3. Some browsers may require user interaction before allowing clipboard access
