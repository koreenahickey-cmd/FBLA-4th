# Venice Local (FBLA Byte-Sized Business Boost)

A desktop prototype built with Electron that helps residents and visitors explore and support small businesses in downtown Venice, Florida. The app runs fully offline using localStorage and includes owner tools, reviews with human verification, and favorites.

## Quick start
1. Install dependencies
   ```bash
   npm install
   ```
2. Run the app in development
   ```bash
   npm start
   ```
3. Build distributables (using electron-builder)
   ```bash
   npm run build
   ```

## Key features
- Local authentication with bot checks (math + keyword challenges)
- Business Owner vs. Local Customer roles
- Browse, search, and filter businesses by category
- Sort by rating, review count, or alphabetically
- Detailed business view with specials/coupons
- Verified reviews and ratings stored locally
- Favorites per user and a dedicated "My Favorites" view
- Owners can add and edit their own businesses

All data is stored locally and pre-seeded with downtown Venice, FL listings so the prototype works offline.
