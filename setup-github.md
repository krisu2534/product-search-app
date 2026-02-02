# Setup GitHub Repository

## Option 1: Create a New Repository on GitHub

1. Go to https://github.com/new
2. Create a new repository (e.g., `product-search-app`)
3. **Don't** initialize with README, .gitignore, or license (we already have files)
4. Copy the repository URL (e.g., `https://github.com/krisu2534/product-search-app.git`)

## Option 2: Use Existing Repository

If you already have a repository, copy its URL.

## Then Run These Commands:

```powershell
# Update the remote URL (replace with your actual repository URL)
git remote set-url origin https://github.com/krisu2534/YOUR-REPO-NAME.git

# Check if there are any uncommitted changes
git status

# If there are changes, stage and commit them
git add .
git commit -m "Update: Add mobile support, HTTPS setup, and improvements"

# Push to GitHub
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys
