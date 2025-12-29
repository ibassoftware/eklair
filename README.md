# Eklair Influencer Search

A TikTok influencer discovery platform for finding and managing influencer partnerships.

## About

This project started from our own need to find and track influencers for marketing campaigns. Instead of paying for expensive CRM tools or using spreadsheets, we built this. Figured other founders and small teams might find it useful, so we're open sourcing it.

Contributors welcome. See the TODO section below if you want to help expand platform support.

## Features

### Search & Discovery
- Search TikTok influencers by keyword
- View engagement metrics (followers, likes, views, shares)
- Quality scoring based on engagement rates
- Video preview and stats

### Lead Management
- Save influencers to your leads bucket
- Organize leads by status (contacted, interested, signed, rejected)
- Add notes to individual influencers
- Summary notes for quick reference

### Search History
- All searches are automatically saved
- Re-run previous searches
- Delete old searches you don't need anymore

### Authentication
- Password-protected access
- 7-day session duration
- Secure httpOnly cookies

## Installation Instructions

### Requirements
- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
# RapidAPI TikTok API
NEXT_PUBLIC_RAPIDAPI_TIKTOK_KEY=your_api_key_here
NEXT_PUBLIC_RAPIDAPI_TIKTOK_URL=https://tiktok-api23.p.rapidapi.com
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
ADMIN_PASSWORD=your_password_here
SESSION_SECRET=generate_a_random_32_char_string
```

3. Get a RapidAPI key:
   - Sign up at https://rapidapi.com/Lundehund/api/tiktok-api23
   - Subscribe to the TikTok API (free tier available)
   - Copy your API key to `.env.local`
   - Note: We're not affiliated with this API provider in any way

4. Set your admin password in `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open http://localhost:3000 and login with your password

The SQLite database will be created automatically in the `data/` directory on first run.

### Production Build

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- Radix UI components

## Notes

- The database file (`data/influencer.db`) is git-ignored and won't be committed
- All data is stored locally in SQLite
- Sessions are managed with signed cookies (no external dependencies)

## TODO

- Instagram integration
- YouTube integration

## License

AGPL-3.0

## Support

Just want this deployed? Want changes or customizations? Need paid support? Buy us a beer? Please reach out to info@ibasuite.com
