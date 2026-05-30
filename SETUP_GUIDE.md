# SomazBet — Complete Setup Guide

## Stack Overview
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite (PWA) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | InfinityFree (cPanel) |
| Android | TWA / PWABuilder |
| CI/CD | GitHub Actions |

---

## STEP 1 — Supabase Setup

1. Go to **https://supabase.com** → Create new project
2. Name it `somazbet`, choose a region close to your users
3. Wait for it to provision (~2 min)
4. Go to **SQL Editor** → New Query
5. Paste the entire content of `supabase_schema.sql` → Click **Run**
6. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Create First Admin Account
In Supabase SQL Editor, run:
```sql
-- First create auth user via Supabase Auth UI or API
-- Then insert admin record:
INSERT INTO public.admin_users (auth_id, username, email, role)
VALUES (
  'YOUR_AUTH_USER_UUID',   -- from auth.users table
  'superadmin',
  'admin@yourdomain.com',
  'superadmin'
);
```

Or use Supabase Dashboard → Authentication → Users → Invite User, then run the INSERT above with that user's UUID.

---

## STEP 2 — Local Development

```bash
# 1. Clone your repo
git clone https://github.com/yourusername/somazbet.git
cd somazbet

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your Supabase credentials
nano .env
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=your_key

# 4. Install dependencies
npm install

# 5. Start dev server
npm run dev
# Open http://localhost:5173
```

---

## STEP 3 — GitHub Setup

```bash
# 1. Create a new repo on GitHub (github.com → New Repository)
# Name: somazbet | Private | No README

# 2. Push your code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/somazbet.git
git push -u origin main

# 3. Add GitHub Secrets (Settings → Secrets → Actions)
# VITE_SUPABASE_URL = your supabase url
# VITE_SUPABASE_ANON_KEY = your anon key
# FTP_SERVER = your infinityfree FTP server (e.g. ftpupload.net)
# FTP_USERNAME = your cPanel FTP username
# FTP_PASSWORD = your cPanel FTP password
```

---

## STEP 4 — InfinityFree / cPanel Deployment

### Manual Upload (simplest)
```bash
# 1. Build the project locally
npm run build
# This creates a /dist folder

# 2. Log into InfinityFree cPanel
# 3. Open File Manager → public_html (or your domain folder)
# 4. Delete existing files (keep .htaccess if exists)
# 5. Upload ALL files from /dist to public_html
# 6. Also upload public/.htaccess to public_html
```

### Via FTP (FileZilla)
```
Host: ftpupload.net (check your InfinityFree panel)
Username: your_cpanel_username
Password: your_cpanel_password
Port: 21
```
Upload everything from `/dist/` to `/htdocs/` or `/public_html/`

### Auto-Deploy via GitHub Actions
Uncomment the FTP Deploy step in `.github/workflows/deploy.yml`
Every push to `main` will automatically build and deploy.

### Domain & SSL
1. In InfinityFree cPanel → **Addon Domains** (if using subdomain) or use the free subdomain
2. Enable **SSL** under Security → SSL/TLS (InfinityFree gives free SSL)
3. Update Supabase: **Authentication → URL Configuration**
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/**`

---

## STEP 5 — Android App

### Option A: PWABuilder (Easiest — No coding!)
1. Deploy your site to InfinityFree first
2. Go to **https://www.pwabuilder.com**
3. Enter `https://yourdomain.com`
4. Click **Package for Stores → Android**
5. Download the APK
6. Install on Android: Settings → Install Unknown Apps → Allow

### Option B: Bubblewrap CLI
```bash
cd android
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://yourdomain.com/manifest.json
# Answer the prompts:
# Package name: com.yourname.bet3999
# App name: SomazBet
# etc.
bubblewrap build
# Output: app-release-signed.apk
```

### assetlinks.json (makes the app feel native, no browser bar)
Create file at: `public/.well-known/assetlinks.json`
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourname.bet3999",
    "sha256_cert_fingerprints": ["YOUR_FINGERPRINT"]
  }
}]
```
Get fingerprint: `keytool -list -v -keystore your.keystore`

---

## STEP 6 — Post-Setup Checklist

- [ ] Supabase schema applied successfully
- [ ] Admin account created in Supabase
- [ ] `.env` filled with real Supabase credentials
- [ ] Site deployed to InfinityFree domain
- [ ] SSL enabled on domain
- [ ] Supabase Auth URL updated to your domain
- [ ] Test user registration & login
- [ ] Test deposit submission → admin approval
- [ ] Admin panel accessible at yourdomain.com/admin
- [ ] APK installed and working on Android
- [ ] Payment method numbers updated in Admin → Financial → Payment Config

---

## File Structure
```
somazbet/
├── src/
│   ├── lib/
│   │   ├── supabase.js          # Supabase client
│   │   └── AuthContext.jsx      # Auth provider
│   ├── pages/
│   │   ├── user/                # User-facing pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── GamesPage.jsx
│   │   │   ├── GameDetailPage.jsx
│   │   │   ├── WalletPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   ├── PromotionsPage.jsx
│   │   │   └── SupportPage.jsx
│   │   └── admin/               # Admin panel pages
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminUsers.jsx
│   │       ├── AdminGames.jsx
│   │       ├── AdminFinancial.jsx
│   │       ├── AdminLogs.jsx
│   │       ├── AdminPromotions.jsx
│   │       ├── AdminAgents.jsx
│   │       ├── AdminContent.jsx
│   │       ├── AdminSupport.jsx
│   │       └── AdminSettings.jsx
│   ├── components/
│   │   ├── shared/BottomNav.jsx
│   │   └── admin/AdminLayout.jsx
│   ├── styles/global.css
│   └── main.jsx
├── public/
│   ├── manifest.json            # PWA manifest
│   └── .htaccess                # SPA routing fix
├── android/setup.sh             # Android app setup
├── supabase_schema.sql          # Full DB schema
├── .env.example                 # Environment template
├── .github/workflows/deploy.yml # Auto-deploy
├── vite.config.js
└── package.json
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Blank page on InfinityFree | Make sure `.htaccess` is in `public_html` |
| Login not working | Check Supabase Auth → Site URL matches your domain |
| CORS errors | Add your domain to Supabase → API → CORS allowed origins |
| Admin can't login | Check `admin_users` table has `auth_id` matching `auth.users` |
| Games not loading | Admin → Games → Add game URL (iframe from provider) |
| Deposit not reflecting | Admin → Financial → Approve pending deposit |

---

## Security Notes
- Never commit `.env` to GitHub (add to `.gitignore`)
- Enable Row Level Security on all Supabase tables (already done in schema)
- Use Supabase Dashboard → Auth → Email templates to customize messages
- Regularly check Admin → Logs for suspicious activity
- Set withdrawal limits in Admin → Settings
