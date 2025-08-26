# 💬 Chatty - Real-Time Chat Application

**A modern, feature-rich real-time chat application built with the MERN stack, featuring advanced messaging, multimedia support, and seamless user experience.**

## 🌐 Live Demo

🚀 **Frontend:** [chatty-eight-zeta.vercel.app](https://chatty-eight-zeta.vercel.app)  
🔗 **Backend API:** [chatty-tn4i.onrender.com](https://chatty-tn4i.onrender.com)

### 🎭 Try Demo Users
- **Email:** `alex.johnson.demo@chatty.com` (or any demo user)
- **Password:** `demo123456`

---

## ✨ Key Features

### 🚀 **Advanced Messaging**
- **Real-time Communication** - Instant messaging with Socket.io
- **Voice Messages** - Record and send high-quality audio messages  
- **File Sharing** - Support for images, videos, audio, and documents
- **Message Management** - Reply, forward, delete, and search messages
- **Rich Media Preview** - In-chat media preview and playback

### 🔐 **Smart Authentication**
- **Email OTP Verification** - Secure signup with professional email templates
- **Multiple Auth Methods** - Email/password and Google Sign-In
- **JWT Security** - Token-based authentication with secure cookies
- **Auto-seeded Demo Users** - 5 demo users available immediately after signup

### 🎨 **Premium User Experience**  
- **Real-time Online Status** - See who's currently active
- **Custom Themes** - Multiple color themes and dark/light mode
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Profile Management** - Customizable profiles with avatar upload
- **Typing Indicators** - Real-time typing notifications

### 📧 **Production-Ready Email System**
- **SendGrid Integration** - Professional email delivery
- **Beautiful Email Templates** - Modern, responsive OTP emails
- **Smart Error Handling** - Comprehensive email delivery monitoring

### 🎵 **Advanced Audio Features**
- **High-Quality Recording** - Optimized audio compression (96kbps)
- **Smart File Management** - Automatic size optimization and limits
- **Multiple Format Support** - WebM, MP3, and WAV compatibility
- **Recording Controls** - Pause, resume, and cancel functionality

---

## 🛠️ Technology Stack

### **Frontend**
- **React.js** - Modern UI library with hooks
- **Zustand** - Lightweight state management  
- **TailwindCSS + DaisyUI** - Utility-first styling with components
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client with interceptors

### **Backend** 
- **Node.js + Express.js** - Fast, scalable server
- **Socket.io** - Real-time bidirectional communication
- **MongoDB + Mongoose** - NoSQL database with ODM
- **JWT** - Secure authentication tokens
- **SendGrid** - Professional email service
- **Cloudinary** - Media storage and optimization

### **DevOps & Deployment**
- **Vercel** - Frontend deployment with edge functions
- **Render** - Backend deployment with auto-scaling
- **MongoDB Atlas** - Cloud database hosting
- **GitHub Actions** - CI/CD pipeline (optional)

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/fromsaurav/Chatty.git
cd Chatty
```

### 2️⃣ Install Dependencies
```bash
# Install both frontend and backend dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### 3️⃣ Environment Configuration

#### Backend Environment (.env in /backend)
```env
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatty
JWT_SECRET=your_super_secret_jwt_key

# SendGrid Email Configuration  
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# URLs
SOCKET_IO_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (.env in /frontend)
```env
# Development
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000

# Production (for Vercel deployment)
# VITE_API_URL=https://your-backend.onrender.com/api
# VITE_SOCKET_URL=https://your-backend.onrender.com
```

### 4️⃣ Run the Application

#### Development Mode
```bash
# Start backend (runs on :4000)
cd backend
npm run dev

# Start frontend (runs on :5173)  
cd frontend
npm run dev
```

#### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend (build)
cd frontend
npm run build
npm run preview
```

### 5️⃣ Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **Socket.io:** Automatically connects via frontend

---

## 🎭 Demo Users

The application automatically creates 5 demo users with realistic profiles:

1. **Alex Johnson** - alex.johnson.demo@chatty.com
2. **Emma Williams** - emma.williams.demo@chatty.com  
3. **Michael Chen** - michael.chen.demo@chatty.com
4. **Sophie Martinez** - sophie.martinez.demo@chatty.com
5. **David Thompson** - david.thompson.demo@chatty.com

**Demo Password:** `demo123456`

These users appear in everyone's contact list, ensuring new users always have someone to chat with!

---

## 📚 API Documentation

### Authentication Endpoints
```bash
POST /api/auth/send-otp          # Send OTP to email
POST /api/auth/complete-signup   # Complete signup with OTP
POST /api/auth/login            # Login with email/password
POST /api/auth/google-login     # Google authentication
POST /api/auth/logout           # Logout user
GET  /api/auth/check           # Check authentication status
```

### Message Endpoints
```bash
GET    /api/messages/users       # Get all users for sidebar
GET    /api/messages/:id         # Get messages with specific user
POST   /api/messages/send/:id    # Send message to user
POST   /api/messages/forward     # Forward message to multiple users
DELETE /api/messages/:id         # Delete message
```

---

## 🚀 Deployment Guide

### **Frontend Deployment (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Backend Deployment (Render)**
1. Create new Web Service on Render
2. Connect your GitHub repository  
3. Set environment variables in Render dashboard
4. Auto-deploy on push to main branch

### **Database Setup (MongoDB Atlas)**
1. Create a MongoDB Atlas cluster
2. Set up database user and network access
3. Get connection string for MONGODB_URI

### **Email Setup (SendGrid)**
1. Create SendGrid account
2. Generate API key with Mail Send permissions
3. Verify sender email address
4. Add API key to environment variables

---

## 🔧 Advanced Features

### **File Upload Optimization**
- **Smart Size Limits:** 50MB for audio, 100MB for video, 20MB for other files
- **Automatic Compression:** Audio files compressed to 96kbps for optimal quality/size
- **Chunked Uploads:** Large files uploaded in 6MB chunks for reliability
- **Format Support:** Images (PNG, JPG, GIF), Videos (MP4, WebM), Audio (WebM, MP3, WAV), Documents (PDF, DOC, etc.)

### **Real-time Features**
- **Live Typing Indicators:** See when someone is typing
- **Online Status:** Real-time user presence updates  
- **Message Status:** Delivered and read receipts
- **Auto-reconnection:** Handles network interruptions gracefully

### **Security Features**
- **JWT Token Security:** HttpOnly cookies with secure flags
- **Input Sanitization:** XSS protection on all user inputs
- **Rate Limiting:** Prevents spam and abuse
- **CORS Configuration:** Restricted to allowed origins only

---

## 📱 Browser Support

- **Chrome** 80+ ✅
- **Firefox** 75+ ✅  
- **Safari** 13+ ✅
- **Edge** 80+ ✅
- **Mobile Safari** 13+ ✅
- **Chrome Mobile** 80+ ✅

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Update documentation for new features
- Test your changes thoroughly before submitting

---

## 🐛 Troubleshooting

### Common Issues

**Socket.io Connection Issues:**
- Check CORS settings in backend
- Verify VITE_SOCKET_URL in frontend environment
- Ensure backend is running before frontend

**Email Not Sending:**
- Verify SendGrid API key and permissions
- Check EMAIL_FROM is a verified sender
- Look at backend logs for detailed error messages

**File Upload Failures:**
- Check Cloudinary credentials and quotas
- Verify file size doesn't exceed limits
- Ensure stable internet connection for large files

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Developer

**Saurav Ganesh Teli**  
🔗 **GitHub:** [fromsaurav](https://github.com/fromsaurav)  
📧 **Email:** telisaurav44@gmail.com  
💼 **LinkedIn:** [Saurav Teli](https://www.linkedin.com/in/saurav-teli-89a27a263)

---

## 🌟 Acknowledgments

- **Unsplash** for demo user profile images
- **Lucide** for beautiful icons
- **TailwindCSS & DaisyUI** for styling framework
- **SendGrid** for reliable email delivery
- **Cloudinary** for media storage and optimization

---

## 📊 Project Stats

- **Languages:** JavaScript, HTML, CSS
- **Framework:** React.js, Node.js, Express.js
- **Database:** MongoDB
- **Lines of Code:** 5,000+ (approx.)
- **Features:** 15+ core features
- **Responsive:** 100% mobile-friendly

---

<div align="center">

### 🚀 Start chatting with style! Try Chatty today.

**[Live Demo](https://chatty-eight-zeta.vercel.app)** | **[Documentation](https://github.com/fromsaurav/Chatty)** | **[Report Issues](https://github.com/fromsaurav/Chatty/issues)**

Made with ❤️ by [Saurav Teli](https://github.com/fromsaurav)

</div>
