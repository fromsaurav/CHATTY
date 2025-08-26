# Chatty Backend Deployment Guide

## Demo Users for Production

The application automatically creates 5 demo users when the server starts. These users will appear in everyone's contact list for testing purposes.

### Demo Users Created:

1. **Alex Johnson** - alex.johnson.demo@chatty.com
2. **Emma Williams** - emma.williams.demo@chatty.com  
3. **Michael Chen** - michael.chen.demo@chatty.com
4. **Sophie Martinez** - sophie.martinez.demo@chatty.com
5. **David Thompson** - david.thompson.demo@chatty.com

**Demo User Password:** `demo123456`

### How It Works:

- Demo users are automatically created when the server starts
- They have `isDemo: true` flag in the database
- They appear in all users' contact lists for testing
- High-quality profile pictures from Unsplash
- Can be used to test chat functionality immediately after signup

### Manual Demo User Creation:

If you need to manually create/recreate demo users:

```bash
npm run seed-demo
```

### For Production Deployment:

1. Set environment variables in your hosting platform (Vercel/Render/etc.)
2. The server will automatically create demo users on first startup
3. Users can immediately start chatting with demo users after signing up

### Environment Variables Required:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=your_email_address
JWT_SECRET=your_jwt_secret
FRONTEND_URL=your_frontend_url
```

This ensures that new users always have someone to chat with, making the app feel active and engaging from the moment they sign up!