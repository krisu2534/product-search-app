# Quick Setup Guide

## Terminal Commands

### Step 1: Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### Step 2: Setup Images

✅ **Images folder has been automatically copied to `frontend/public/images/`**

If you need to copy it again manually, run:
```powershell
Copy-Item -Path "images" -Destination "frontend/public/images" -Recurse
```

Or simply drag the `images` folder from the root directory into `frontend/public/` using File Explorer.

### Step 3: Start the Servers

**Terminal 1 - Backend Server:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend Server:**
```powershell
cd frontend
npm run dev
```

### Step 4: Access the App

Open your browser and go to: `http://localhost:3000`

---

## Alternative: Use Setup Script

You can also run the automated setup script:

```powershell
.\setup.ps1
```

This will install all dependencies and set up the images folder automatically.
