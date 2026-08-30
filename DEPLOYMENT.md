# God Complex Foundry System - Deployment Guide

## Quick Deploy Checklist

### Before Deploying
- [ ] All changes committed to git
- [ ] Version number updated in `system.json`
- [ ] Tested locally in Foundry VTT
- [ ] `data/` directory contains latest backgrounds, abilities, equipment

### Build & Release Process

#### Option 1: Automated Build Script (Recommended)
```powershell
# Build with version prompt
.\build.ps1

# Or specify version directly
.\build.ps1 -Version "1.1.0"
```

This will:
1. Update version in system.json
2. Create clean build directory
3. Generate `godcomplex-{version}.zip`
4. Show next steps for git tagging

#### Option 2: Manual Build
```powershell
# Create build directory
mkdir build

# Copy system files
Copy-Item system.json, template.json build/
Copy-Item -Recurse module, templates, styles, languages, macros, data build/

# Create zip
Compress-Archive -Path build/* -DestinationPath "godcomplex-{version}.zip"
```

### Git Workflow

```bash
# 1. Stage all changes
git add -A

# 2. Commit with descriptive message
git commit -m "release: v1.1.0 - Add compendium data"

# 3. Create annotated tag
git tag -a v1.1.0 -m "Version 1.1.0: Added backgrounds, abilities, equipment data"

# 4. Push everything
git push origin main --tags

# 5. Create GitHub Release
# Go to: https://github.com/kdpomeroy/GodComplexFoundry/releases/new
# - Tag: v1.1.0
# - Title: God Complex v1.1.0
# - Attach: godcomplex-1.1.0.zip
# - Auto-generate release notes
```

### Foundry Forge Deployment

After GitHub release:
1. **Update manifest** (if needed):
   - `system.json` manifest URL should point to raw GitHub
   - Download URL should point to release zip

2. **Submit to Forge** (if publishing publicly):
   - Go to: https://foundryvtt.com/packages/
   - Submit package manifest URL: `https://raw.githubusercontent.com/kdpomeroy/GodComplexFoundry/main/system.json`
   - Foundry will automatically pull new versions from GitHub releases

### Local Testing

Before releasing, test the build:
```powershell
# Build without creating zip (for quick testing)
.\build.ps1 -SkipZip

# Copy build to Foundry Data
Copy-Item -Recurse -Force build/* "$env:FOUNDRY_DATA/systems/godcomplex/"

# Restart Foundry and test
```

## Version Numbering

Use semantic versioning:
- **MAJOR** (2.0.0): Breaking changes, major new features
- **MINOR** (1.2.0): New features, backwards compatible
- **PATCH** (1.1.1): Bug fixes, minor improvements

## Troubleshooting

### "Reverted to older version"
If Foundry shows an old version:
1. Check `system.json` version field
2. Verify git tag matches version
3. Ensure GitHub release has correct zip attached
4. Clear Foundry cache: `Ctrl+Shift+R` or delete `Data/cache/`
5. Check manifest URL is correct in Foundry package manager

### Data not loading
- Verify `data/` directory exists in build
- Check file permissions
- Look for console errors in Foundry (F12)

### Missing files in zip
- Check `.gitignore` isn't excluding needed files
- Verify build script includes all directories
- Compare build/ contents with source

## File Structure

```
foundry/
├── system.json          # System manifest (version lives here)
├── template.json        # Data model definitions
├── module/              # JavaScript source code
│   ├── godcomplex.js    # Main entry point
│   ├── actor/           # Actor documents and sheets
│   ├── item/            # Item documents and sheets
│   ├── apps/            # Applications (character creator, etc.)
│   ├── dice.js          # Dice rolling system
│   ├── combat.js        # Combat automation
│   └── settings.js      # System settings
├── templates/           # Handlebars templates
├── styles/              # CSS styles
├── languages/           # Localization files
├── macros/              # Example macros
├── data/                # Game data (backgrounds, abilities, equipment)
│   ├── backgrounds.json
│   ├── powerset-abilities.json
│   └── equipment-catalogue.json
├── build.ps1            # Build script
└── README.md            # This file
```

## Automated Releases (Optional)

To automate GitHub releases, create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: |
          # Install dependencies if needed
          # Build system
          
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: godcomplex-*.zip
```

## Support

- GitHub Issues: https://github.com/kdpomeroy/GodComplexFoundry/issues
- Foundry Discord: #god-complex
