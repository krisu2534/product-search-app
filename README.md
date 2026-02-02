# Product Search & Copy App

A home-hosted application for searching products and copying images to LINE chat.

## Project Structure

```
.
├── backend/          # Node.js/Express server
├── frontend/         # Vite + React + Tailwind CSS
│   └── public/
│       └── images/   # Product images (ONLY images folder needed)
└── products.xlsx     # Product database
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Images Folder

✅ **Images are stored in `frontend/public/images/`**

**Important:** The app only uses images from `frontend/public/images/`. If you have an `images/` folder in the root directory, you can safely delete it - it's not used by the application.

If you need to add or update images, place them directly in `frontend/public/images/`.

### 4. Start the Application

You have several options to start the servers:

**Option 1: Use the batch files (Easiest - Just double-click!)**
- Double-click `start-all.bat` to start both servers in separate windows
- Or double-click `start-backend.bat` for backend only
- Or double-click `start-frontend.bat` for frontend only

**Option 2: Use PowerShell scripts**
Right-click the `.ps1` files and select "Run with PowerShell":
- `start-all.ps1` - Starts both servers
- `start-backend.ps1` - Starts backend only
- `start-frontend.ps1` - Starts frontend only

**Option 3: Manual terminal commands**
Open two PowerShell/terminal windows:

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

The backend will run on `http://localhost:3001`  
The frontend will run on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Features

- **Real-time Search**: Filter products as you type
- **Image Gallery**: View multiple product images with thumbnails
- **Copy to LINE**: Copy images directly to clipboard for pasting into LINE chat
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## API Endpoints

- `GET /api/products` - Returns all products from the Excel file

## Notes

- The Excel file (`products.xlsx`) should be in the root directory
- Product images should be in `frontend/public/images/`
- The Photo column in Excel can contain comma-separated filenames, which will be automatically split into an array
