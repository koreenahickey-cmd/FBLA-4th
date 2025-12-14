# Venice Local (FBLA Byte-Sized Business Boost)

![Venice Local logo](assets/venice-local.png)

Electron desktop prototype that helps Venice, FL residents and visitors discover and support local businesses. The app runs fully offline using `localStorage` and ships with owner tools, human-verified reviews, and favorites.

## Prerequisites
- Node.js 18+ (includes npm)
- macOS, Windows, or Linux (Electron target)

## Setup
1. Install dependencies  
   ```bash
   npm install
   ```
2. (Optional) If the repo isn’t on your machine yet, clone it first:  
   ```bash
   git clone <repo-url>
   cd FBLA-4th
   npm install
   ```

## Run in development (opens the app)
Start Electron and launch the UI in a window:
```bash
npm start
```
The app will open immediately. If it doesn’t, check the terminal for errors and re-run `npm start` after installing dependencies.

## Build a packaged app
Create a distributable for your current OS with electron-builder:
```bash
npm run dist
```
The installer/output lives in `dist/` (e.g., `.dmg` on macOS, `.exe` on Windows, `.AppImage` on Linux). Open the generated file to install/run the packaged app.

## What you get
- Local authentication with bot checks (math + keyword challenges)
- Business Owner vs. Local Customer roles
- Browse, search, and filter businesses by category
- Sort by rating, review count, or alphabetically
- Detailed business view with specials/coupons
- Verified reviews and ratings stored locally
- Favorites per user and a dedicated “My Favorites” view
- Owners can add and edit their own businesses

All data lives locally and is pre-seeded with downtown Venice, FL listings so the prototype works offline.
