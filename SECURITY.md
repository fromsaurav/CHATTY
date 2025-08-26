# 🔐 Security Guidelines

## ⚠️ IMPORTANT: Exposed API Keys Remediation

**CRITICAL ACTION REQUIRED:** If you've previously pushed commits with hardcoded Firebase API keys, follow these steps immediately:

### 🚨 Immediate Actions:

1. **Revoke Compromised Keys:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Navigate to Project Settings > General
   - Delete the exposed API key
   - Generate a new API key

2. **Remove from Git History:**
   ```bash
   # WARNING: This rewrites git history - coordinate with team
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch frontend/src/lib/firebaseConfig.js backend/src/lib/firebaseConfig.js' \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push to update remote
   git push origin --force --all
   ```

### ✅ Current Security Status:

- **Firebase API Keys:** Now properly stored in environment variables
- **Hardcoded Values:** Completely removed from source code
- **Environment Variables:** Used for all sensitive configuration

### 🔧 Environment Variables Setup:

#### Frontend (.env)
```env
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_new_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API URLs
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

#### Backend (.env)
```env
# Firebase Configuration (REQUIRED)
FIREBASE_API_KEY=your_new_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Other environment variables...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 📋 Security Checklist:

- ✅ All API keys moved to environment variables
- ✅ No hardcoded secrets in source code
- ✅ Environment files added to .gitignore
- ✅ Production environment variables set in hosting platforms
- ⚠️ Old Firebase API key needs to be revoked (if previously exposed)
- ⚠️ Git history needs cleaning (if previously committed)

### 🔒 Best Practices:

1. **Never commit sensitive data** to version control
2. **Use environment variables** for all configuration
3. **Regularly rotate API keys** and secrets
4. **Monitor for exposed secrets** using tools like GitGuardian
5. **Use separate environments** for development, staging, and production

### 🚨 If Keys Were Already Exposed:

If the hardcoded API keys were already pushed to GitHub:

1. **Immediately revoke** the exposed Firebase API key
2. **Generate new keys** in Firebase Console
3. **Update environment variables** in all environments
4. **Consider cleaning git history** (coordinate with team)
5. **Monitor Firebase usage** for any unauthorized access

### 📞 Support:

If you need help with security remediation, please:
- Check Firebase Console for suspicious activity
- Rotate all API keys and secrets
- Update deployment environment variables
- Test application functionality after key rotation