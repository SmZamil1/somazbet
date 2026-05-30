# SomazBet — Android-Only Setup Guide
### Everything done from your Android phone. No PC needed.

---

## What You'll Use (All Free)
| Tool | What For | Link |
|------|----------|------|
| Supabase | Database + Login | supabase.com |
| InfinityFree | Free Web Hosting | infinityfree.com |
| GitHub | Code Storage | github.com |
| Spck Editor | Code Editor on Android | Play Store |
| GitDroid / Pocket Git | Git on Android | Play Store |
| PWABuilder | Create Android APK | pwabuilder.com |
| FTP Disk / AndFTP | Upload files to host | Play Store |

---

# PHASE 1 — Accounts Setup (15 minutes)

## 1.1 Create Supabase Account
1. Open Chrome → go to **supabase.com**
2. Tap **Start your project** → Sign up with Google
3. Tap **New Project**
4. Fill in:
   - **Name:** SomazBet
   - **Database Password:** (save this somewhere safe!)
   - **Region:** Southeast Asia (or nearest to you)
5. Tap **Create new project** → wait 2–3 minutes
6. Once ready, tap **Settings** (gear icon, bottom left)
7. Tap **API**
8. **Copy and save these two values:**
   - `Project URL` → looks like: `https://abcxyz.supabase.co`
   - `anon public` key → long string starting with `eyJ...`

---

## 1.2 Create InfinityFree Account
1. Go to **infinityfree.com**
2. Tap **Register** → sign up with email
3. After login, tap **+ Create Account**
4. Choose a **subdomain** (e.g. `somazbet`) → it'll be `somazbet.rf.gd` or similar
5. **Save your:**
   - FTP Hostname (e.g. `ftpupload.net`)
   - FTP Username
   - FTP Password
   - Your site URL (e.g. `https://somazbet.rf.gd`)

---

## 1.3 Create GitHub Account
1. Go to **github.com**
2. Sign up → verify email
3. Tap **+** → **New repository**
4. Name: `somazbet`
5. Set to **Private**
6. Tap **Create repository**
7. **Save the repo URL** (e.g. `https://github.com/yourname/somazbet`)

---

# PHASE 2 — Edit & Upload Code (20 minutes)

## 2.1 Install Apps on Your Android
Install these from Play Store:

```
✅ Spck Editor (code editor)
✅ FTP Disk  OR  AndFTP (file uploader)
✅ ZArchiver (zip/unzip files)
```

---

## 2.2 Extract the Project
1. Download **somazbet-complete.zip** to your phone
2. Open **ZArchiver** → find the zip
3. Long-press it → **Extract here**
4. You now have a `somazbet/` folder

---

## 2.3 Edit Your Credentials in the Code
1. Open **Spck Editor**
2. Tap the folder icon → Open folder → find `somazbet/src/lib/supabase.js`
3. Find these two lines:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'
```

4. Replace the placeholder values with YOUR real values:

```javascript
const SUPABASE_URL = 'https://abcxyzabc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

5. Save the file (tap the save icon or Ctrl+S)

---

## 2.4 Upload Files to InfinityFree via FTP

Since you can't run `npm build` on Android easily, we'll upload the **pre-built** version. The zip includes a ready-to-use static build approach — follow these steps:

### Option A: Use Online Build Service (Easiest)

1. Go to **stackblitz.com** in Chrome
2. Tap **Import from GitHub**
   - Or tap **Open from URL** and paste your GitHub repo URL
3. Once loaded, open the Terminal at bottom
4. Type:
   ```
   npm install
   npm run build
   ```
5. After build completes, a `dist/` folder appears
6. Tap the `dist` folder → right-click → **Download as ZIP**
7. Save to your phone

### Option B: Use Replit (Also works on Android)

1. Go to **replit.com** → Sign up free
2. Tap **+ Create Repl** → Choose **Import from GitHub**
3. Paste your GitHub repo URL
4. In the Shell tab, type:
   ```bash
   npm install
   npm run build
   ```
5. After build, right-click `dist/` folder → Download

---

## 2.5 Upload Built Files to InfinityFree

1. Open **FTP Disk** app on your Android
2. Tap **+** → New Connection:
   - **Host:** `ftpupload.net` (your InfinityFree FTP server)
   - **Username:** your InfinityFree FTP username
   - **Password:** your InfinityFree FTP password
   - **Port:** 21
3. Connect → navigate to `htdocs/` folder
4. **Delete** any existing files in htdocs
5. **Upload ALL files** from your `dist/` folder into `htdocs/`
6. Also upload the `.htaccess` file from `public/.htaccess` into `htdocs/`

> ⚠️ Make sure `.htaccess` is uploaded — without it, page refresh will show 404 errors!

---

# PHASE 3 — Database Setup (10 minutes)

## 3.1 Run the Database Schema

1. Go back to **supabase.com** → Your SomazBet project
2. Tap **SQL Editor** (left sidebar, looks like `</>`)
3. Tap **+ New query**
4. Open **Spck Editor** → open `somazbet/supabase_schema.sql`
5. Select ALL the text (long-press → Select All)
6. Copy it
7. Paste into Supabase SQL Editor
8. Tap **Run** (green button)
9. You should see: `Success. No rows returned`

---

## 3.2 Create Your Admin Account

### Step 1 — Create Auth User
1. In Supabase → tap **Authentication** (person icon, left sidebar)
2. Tap **Users** → **Invite user**
3. Enter your email (e.g. `admin@somazbet.com`)
4. Tap **Send invitation** (or use **Add user** → set email + password)
5. **Copy the User UUID** — it looks like: `a1b2c3d4-e5f6-...`

### Step 2 — Insert Admin Record
1. Go back to **SQL Editor**
2. Run this query (replace with YOUR UUID and email):

```sql
INSERT INTO public.admin_users (auth_id, username, email, role)
VALUES (
  'PASTE_YOUR_UUID_HERE',
  'admin',
  'admin@somazbet.com',
  'superadmin'
);
```

3. Tap **Run** → `1 row inserted` ✅

---

## 3.3 Update Supabase Auth Settings

1. Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://somazbet.rf.gd` (your InfinityFree URL)
3. Under **Redirect URLs**, add: `https://somazbet.rf.gd/**`
4. Tap **Save**

---

# PHASE 4 — Test Your Site (5 minutes)

## 4.1 Test in Chrome
1. Open Chrome on your Android
2. Go to your site URL: `https://somazbet.rf.gd`
3. You should see the **SomazBet landing page** ✅
4. Tap **Create Account** → register a test user
5. Log in → check all pages work

## 4.2 Test Admin Panel
1. Go to `https://somazbet.rf.gd/admin`
2. Log in with your admin email & password
3. Dashboard should load with stats ✅

---

# PHASE 5 — Android APK (15 minutes)

## 5.1 Make Site installable first
Your site is already a PWA (Progressive Web App). Test it:
1. Open Chrome → go to your site
2. Chrome will show **"Add to Home Screen"** banner
3. Tap it → it installs like an app! (This is the quickest option)

## 5.2 Create a Real APK with PWABuilder

1. Open Chrome → go to **pwabuilder.com**
2. In the URL box, type your site: `https://somazbet.rf.gd`
3. Tap **Start** → wait for it to analyze your site
4. It should say **"PWA is store-ready"** or similar
5. Tap **Package for Stores**
6. Tap **Android** tab
7. Fill in:
   - **Package ID:** `com.somazbet.app`
   - **App name:** `SomazBet`
   - **App version:** `1.0`
   - Leave rest as default
8. Tap **Generate Package**
9. Download the ZIP → extract on your phone (use ZArchiver)
10. Inside you'll find `somazbet.apk`

## 5.3 Install the APK on Your Android

1. Open **Settings** on your phone
2. Go to **Security** (or Privacy) → **Install Unknown Apps**
3. Enable for **Chrome** or **Files** (whichever you'll use to open APK)
4. Navigate to the APK file → tap it
5. Tap **Install** → **Done**
6. SomazBet icon appears on your home screen! 🎉

---

# PHASE 6 — Configure Your App (5 minutes)

## 6.1 Set Up Payment Methods
1. Open SomazBet → login as admin → go to `/admin`
2. Go to **Financial Control** tab
3. Tap **Payment Config**
4. Enable/disable payment methods (bKash, Nagad, Rocket, Bank)
5. Edit the payment phone numbers users will send money to

## 6.2 Add Your First Games
1. Admin Panel → **Game Management**
2. Tap **+ Add Game**
3. Fill in game name, category, min/max bet
4. If you have a game provider (e.g. JDB, JILI, PG Soft), paste their iframe URL
5. Save → game appears in the app

## 6.3 Create First Promotion
1. Admin → **Promotion Manager** → **+ New Promotion**
2. Title: "Welcome Bonus 100%!"
3. Type: bonus, Amount: 500
4. Save → appears on home screen immediately

---

# Quick Reference Card

```
🌐 Your Site:     https://somazbet.rf.gd
🛡️ Admin Panel:  https://somazbet.rf.gd/admin
📊 Supabase:     supabase.com (your project)
📁 GitHub:       github.com/yourname/somazbet

👤 Admin Login:  your admin email + password
📱 APK:          pwabuilder.com → your site URL
```

---

# Troubleshooting

| Problem | Solution |
|---------|----------|
| Site shows 404 on refresh | .htaccess not uploaded — upload it to htdocs/ |
| Login not working | Check Supabase → Auth → Site URL matches your domain |
| Admin login fails | Make sure admin_users row was inserted with correct UUID |
| APK won't install | Enable Unknown Sources in Android Settings → Security |
| PWABuilder says "not a valid PWA" | Make sure manifest.json and .htaccess are both uploaded |
| FTP upload fails | Check InfinityFree cPanel → FTP Accounts for correct credentials |
| Balance not updating after deposit | Admin must approve it in Financial Control |
| Games show "Coming Soon" | Add game provider iframe URL in Admin → Game Management |

---

# Daily Admin Tasks (from your phone)

1. Open Chrome → `somazbet.rf.gd/admin`
2. **Check Financial Control** → approve any pending deposits/withdrawals
3. **Check Support** → reply to user tickets
4. **Check Logs** → review betting activity
5. **Manage Users** → handle any ban requests

---

# Optional Upgrades (Later)

| Upgrade | How |
|---------|-----|
| Custom domain (.com) | Buy on Namecheap → point to InfinityFree |
| Better hosting | Move to HostGator or SiteGround when you grow |
| Real game providers | Integrate JILI, PG Soft, Pragmatic Play APIs |
| Real payment API | bKash Merchant API, SSLCommerz, Stripe |
| Push notifications | Add Firebase Cloud Messaging |
| Play Store listing | Use PWABuilder AAB + Google Play Console ($25 one-time) |

---

*Built with React + Supabase + InfinityFree. All steps doable from Android only.*
