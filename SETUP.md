# 🚀 Chatty Setup Guide

## 🔧 Environment Variables Configuration

### 1. Backend Setup

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure your `.env` file with actual values:**

   - **MongoDB:** Get connection string from [MongoDB Atlas](https://cloud.mongodb.com)
   - **JWT Secret:** Generate a secure random string
   - **SendGrid:** Get API key from [SendGrid](https://sendgrid.com)
   - **Cloudinary:** Get credentials from [Cloudinary](https://cloudinary.com)
   - **Firebase:** Get config from [Firebase Console](https://console.firebase.google.com)

### 2. Frontend Setup

1. **Copy the example file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Configure your `.env` file:**
   - Use the same Firebase config as backend
   - Set API URLs (localhost for development)

## 🔑 Getting Service Credentials

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Go to Project Settings → General
4. Scroll down to "Your apps" section
5. Copy the config object values

### SendGrid Setup
1. Create account at [SendGrid](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create API key with "Mail Send" permissions
4. Verify sender email address

### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster
3. Create database user
4. Get connection string from "Connect" button

## ⚠️ Security Important

- **Never commit** `.env` files to version control
- **Never share** API keys publicly
- **Rotate keys** regularly for production use
- **Use different** credentials for development/production

## 🚀 Production Deployment

### Vercel (Frontend)
1. Add environment variables in Vercel dashboard
2. Use production API URLs

### Render (Backend)  
1. Add environment variables in Render dashboard
2. Use production database URLs

## 🔒 Security Best Practices

1. ✅ Use `.env.example` files (safe to commit)
2. ✅ Keep actual `.env` files in `.gitignore`
3. ✅ Use different keys for dev/prod environments
4. ✅ Rotate API keys regularly
5. ✅ Never hardcode credentials in source code

## 🆘 Need Help?

If you encounter issues:
1. Check the example files for correct variable names
2. Verify all services are properly configured
3. Check console for specific error messages
4. Ensure environment variables are set in hosting platforms