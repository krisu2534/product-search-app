# Railway Deployment Guide

## ✅ Files Created for Railway

1. **`package.json`** (root) - Build and start scripts
2. **`nixpacks.toml`** - Railway build configuration
3. **`backend/server.js`** - Updated to serve static files

## 🚀 Next Steps

### Step 1: Commit and Push to GitHub

```bash
git add .
git commit -m "Add Railway deployment configuration"
git push
```

### Step 2: Railway Will Auto-Deploy

- Railway automatically detects the new commit
- It will run the build process:
  1. Install backend dependencies
  2. Install frontend dependencies  
  3. Build frontend (creates `frontend/dist`)
  4. Start the server

### Step 3: Expose Your Service

1. Go to your Railway dashboard
2. Click on your service
3. Go to the **"Settings"** tab
4. Click **"Generate Domain"** or **"Custom Domain"**
5. Your app will be available at: `https://your-app-name.up.railway.app`

### Step 4: Verify Deployment

- Check the **"Deployments"** tab for build status
- Check the **"Logs"** tab if there are any errors
- Visit your generated URL to test the app

## 📝 What Changed

- **Root `package.json`**: Defines build and start commands
- **`nixpacks.toml`**: Tells Railway how to build your app
- **`server.js`**: Now serves both API (`/api/products`) and static files (React app + images)

## 🔧 Troubleshooting

If deployment fails:

1. **Check Logs**: Click "View logs" in Railway dashboard
2. **Common Issues**:
   - Missing `products.xlsx` file → Make sure it's committed to Git
   - Build errors → Check that all dependencies are in `package.json`
   - Port issues → Railway sets `PORT` automatically, no changes needed

## ✨ Your App Structure

```
/
├── package.json          ← Root build config
├── nixpacks.toml         ← Railway config
├── products.xlsx         ← Your database
├── backend/
│   ├── server.js        ← Serves API + static files
│   └── package.json
└── frontend/
    ├── public/images/   ← Your product photos
    ├── dist/            ← Built files (created during build)
    └── package.json
```

## 🎉 After Deployment

Your app will be live at: `https://your-app-name.up.railway.app`

- Frontend: Automatically served
- API: Available at `/api/products`
- Images: Available at `/images/your-photo.jpg`
