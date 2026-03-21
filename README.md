# Peak Sports Gallery — Simple Genius Platform

## Stack
- React + Vite
- Supabase (PostgreSQL + Auth)
- n8n (AI agent webhook)
- Vercel (hosting)

## Setup

### 1. Clone and install
```bash
git clone https://github.com/lazycryptotrapstar-tech/peaksportsgallery.git
cd peaksportsgallery
npm install
```

### 2. Environment variables
Create `.env` in root:
```
VITE_SUPABASE_URL=https://duxfxzblueyrlzttqtgk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_N8N_WEBHOOK_URL=https://n8n-production-f9c2.up.railway.app/webhook/2e28cfe9-961f-48fb-a548-3f0306448996/chat
```

### 3. Supabase schema
- Go to supabase.com → SQL Editor → New Query
- Paste contents of `supabase_schema.sql` and run

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy
```bash
git add .
git commit -m "initial build"
git push
```
Vercel auto-deploys on push to main. Add env vars in Vercel → Settings → Environment Variables.

## Adding a new school
Edit `src/data/schools.js` — add one object to the SCHOOLS export. No other changes needed.

## Adding a new module
Create `src/modules/YourModule/YourModule.jsx`, import it in `App.jsx`, add to the switch statement and nav items.
