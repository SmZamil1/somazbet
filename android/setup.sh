# Android App Setup using TWA (Trusted Web Activity)
# This wraps your PWA as a native Android app — no coding needed!

# ============================================
# OPTION 1: Bubblewrap CLI (Recommended)
# ============================================

# Step 1: Install Bubblewrap
npm install -g @bubblewrap/cli

# Step 2: Init your Android project (run in /android folder)
bubblewrap init --manifest=https://yourdomain.com/manifest.json

# Step 3: Build APK
bubblewrap build

# This generates:
# - app-release-signed.apk (install directly)
# - app-release.aab (for Play Store)

# ============================================
# OPTION 2: PWABuilder (No-code, GUI)
# ============================================
# 1. Go to https://www.pwabuilder.com
# 2. Enter your site URL: https://yourdomain.com
# 3. Click "Start" → "Android" → Download APK
# 4. Install APK directly on your phone

# ============================================
# ASSETLINKS.JSON (Required for TWA)
# ============================================
# Create this file at: yourdomain.com/.well-known/assetlinks.json
# Get your SHA-256 from your keystore:
# keytool -list -v -keystore my-release-key.keystore

[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourname.bet3999",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_HERE"]
    }
  }
]
