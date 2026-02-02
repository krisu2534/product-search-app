# Cleanup Instructions

## Remove Duplicate Images Folder

You have two images folders:
- `images/` (root directory) - **NOT USED** - Can be deleted
- `frontend/public/images/` - **USED BY APP** - Keep this one

The app only uses images from `frontend/public/images/` because Vite serves static files from the `public` folder.

## To Remove the Root Images Folder:

**Option 1: Using File Explorer**
1. Navigate to the project root directory
2. Right-click on the `images` folder
3. Select "Delete"
4. Confirm deletion

**Option 2: Using PowerShell**
```powershell
Remove-Item -Path "images" -Recurse -Force
```

**Option 3: Using Command Prompt**
```cmd
rmdir /s /q images
```

After deletion, your project structure should only have:
```
.
├── backend/
├── frontend/
│   └── public/
│       └── images/  ← Only this images folder should exist
└── products.xlsx
```
