# Venice Local

![Venice Local logo](assets/venice-local.png)

Welcome to Venice Local! This is our 2025-2026 FBLA Coding & Programming Project. Venice Local is a desktop application designed to help users discover and support small, local businesses in Venice, Florida.

Local business owners can add their businesses to the app, and community members can browse listings, leave reviews, and save their favorite places. If a business is offering a special deal or promotion, it will be displayed on the business's listing. The app uses a backend created with Supabase to securely store business listings, reviews, and user data so information is saved and updated in real time. The goal of this project is to strengthen the local community by making it easier for people to find and support nearby businesses.
All business entries represent real small local businesses in Downtown Venice, FL, and details (hours, descriptions, addresses, photos, etc.) were gathered from TripAdvisor and Yelp.

---

## Get the Project
- GitHub: https://github.com/koreenahickey-cmd/Venice-Local.git (Code -> Download ZIP) or `git clone (https://github.com/koreenahickey-cmd/Venice-Local.git)`
- Make sure Node.js 18+ is installed (macOS: `brew install node`, Windows: download from nodejs.org).

## Open and Run (source code)
1) Download or clone the repo, then open Terminal/PowerShell in the project folder.  
2) Install dependencies once: `npm install`.  
3) Launch the app from source: `npm start`. Electron opens a Venice Local window using the local code.

## Build an Installer/App
1) Complete steps 1-2 above.  
2) Build a packaged app: `npm run dist` (creates output in `dist/`).  
3) macOS: open the `.dmg` in `dist`, then drag Venice Local into Applications.  
4) Windows: run the `.exe` in `dist` and follow the installer prompts.  
5) After installation, open Venice Local like a normal app; no terminal needed.

---

## Project Structure (key files)
```
Venice-Local/
├─ assets/                 # images and static assets
├─ dist/                   # packaged builds (created by npm run dist)
├─ index.html              # main app HTML
├─ main.js                 # Electron main process
├─ renderer.js             # renderer process logic
├─ preload.js              # context bridge configuration
├─ supabaseClient.js       # Supabase client setup
├─ styles.css              # global styles
├─ service-worker.js       # PWA/offline support
├─ manifest.json           # app metadata
├─ package.json            # scripts and dependencies
└─ package-lock.json       # lockfile
```

---

## Directions to Use  
To use Venice Local, launch the application and browse through local businesses listed in Venice, FL. Users can explore businesses by category, view details, leave reviews, and bookmark their favorite businesses for easy access later. Business owners can also submit their own businesses to be featured in the app.

---

## Developers  
Koreena Hickey  
Emma Nguyen  

---

## Default Accounts
- Business owner — email: `businessowner@gmail.com`, password: `FBLA2025`  
- Reviewer — email: `reviewer@gmail.com`, password: `FBLA2025`

---

## Software & Languages Used  
Visual Studio Code  
GitHub  
Adobe Photoshop  
Supabase  
JavaScript  
HTML  
CSS  

---

## Credits  
App logo created by Emma Nguyen.  
Typography: Copasetic font by Font Diner (sourced from DaFont).

---

## Contact  
For any questions please email emmanguyen0915@gmail.com!
