# Torchlight Tracker

Electron app for tracking Torchlight Infinite inventory and prices.

## Development

- Install deps: `npm install`
- Run dev: `npm run dev`
- Build: `npm run build`
- Package (Windows): `npm run package`

## Project Structure

- `src/` — TypeScript source
- `src/ui/` — HTML/CSS UI (copied to `dist/ui/` on build)
- `dist/` — compiled output (ignored in git)
- `release/` — packaged app outputs (ignored in git)

## Automated Releases

The project uses **automated releases** via GitHub Actions:

### Production Release (`npm run prod`)
1. **Increments version** in `package.json` (patch version)
2. **Commits** all changes with release message
3. **Pushes** code to GitHub
4. **Creates and pushes** a git tag (e.g., `v1.0.1`)
5. **Triggers GitHub Actions** which:
   - Builds the application
   - Creates a GitHub Release
   - Uploads the `.exe` and `item_database.json`
6. **Users get update notifications** when the app checks for updates

**Usage:**
```bash
npm run prod
```

This fully automates the release process - no manual steps needed!

### Auto-Updater
- The app checks for updates on startup and every 30 minutes
- Users see a popup when updates are available
- Updates download automatically (with user confirmation)
- App restarts after download completes

### Manual Release (if needed)
If you need to manually create a release:
```bash
npm run package  # Build locally
# Then manually upload to GitHub Releases
```

## Initial Setup

### 1. Create Private GitHub Repo

```bash
# From project root
git init
git add .
git commit -m "Initial commit"
# Create a new PRIVATE repo on GitHub named torchlight-tracker
# Then set remote and push main
git branch -M main
git remote add origin https://github.com/<your-username>/torchlight-tracker.git
git push -u origin main
```

### 2. Configure Package.json

Update `package.json` with your GitHub username:
```json
"publish": {
  "provider": "github",
  "owner": "YOUR_GITHUB_USERNAME",  // ← Change this!
  "repo": "torchlight-tracker",
  "private": true
}
```

### 3. GitHub Actions Permissions

For private repos, ensure GitHub Actions has permissions:
- Go to repo Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

## Packaging notes (Windows)

- If packaging fails with symlink or code-sign errors, run your terminal/IDE as Administrator or enable Windows Developer Mode.
- Outputs are written to `release/`.
