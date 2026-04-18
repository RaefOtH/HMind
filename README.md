# HMind: Text Organizer

Write texts, assign them a theme, and they get saved automatically — one file per theme. No AI, no internet needed.

## Requirements
- Node.js 18+

## Run locally
```bash
npm install
npm start
```

## Build Windows installer
Place a 256×256 `icon.ico` in `assets/icon.ico`, then:
```bash
npm run build:win
```

Output in `dist/`:
- `Smart Text Organizer Setup.exe` — NSIS installer
- `Smart Text Organizer.exe`       — portable single-file exe

## Data location
One JSON file per theme, stored at:
`%APPDATA%\smart-text-organizer\entries\{Theme Name}.json`

Click **📂 Open** in the sidebar to open the folder directly.
