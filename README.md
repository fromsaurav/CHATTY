# 📢 Chatty - Real-Time Chat Application

Chatty is a modern real-time chat application built using the **MERN stack** with **Socket.io** for instant communication. It features a sleek UI powered by **TailwindCSS** and **Daisy UI**, ensuring a smooth and responsive user experience.

## 🔗 Live Demo

**Frontend:** [chatty-eight-zeta.vercel.app](https://chatty-eight-zeta.vercel.app)  
**Backend API:** [chatty-tn4i.onrender.com](https://chatty-tn4i.onrender.com)

---

## 🏆 Problem Statement

In today's digital world, communication plays a crucial role in personal and professional life. Existing messaging apps often lack customization, real-time features, and easy accessibility across different devices. Additionally, users require secure authentication, multimedia sharing, and real-time engagement.

### 🔍 Challenges in Existing Solutions
- Lack of **real-time interactivity** in many chat applications.
- **Limited multimedia support** (text-only or basic file sharing).
- **Poor authentication mechanisms**, making apps prone to security risks.
- **Limited user control** over messages (editing, forwarding, deleting, replying).
- **Inefficient state management**, leading to performance issues.

### 🚀 Proposed Solution
Chatty is designed to address these limitations by providing a **fully interactive** chat experience with real-time updates, secure authentication, media sharing, and customizable themes.

---

## 🎯 Key Features & Functionalities

### ✉️ **Messaging & Communication**
✅ **Real-time Messaging:** Instant chat powered by **Socket.io**.  
✅ **Text & Multimedia Support:** Send messages in **text, attachments, and audio** formats.  
✅ **Audio Recording:** Record and share voice messages seamlessly.  
✅ **Message Controls:** Forward, share, delete, and reply to messages.  
✅ **Chat Search:** Quickly find past conversations.  

### 🔐 **Security & Authentication**
✅ **Authentication & Authorization:** Secure login/signup with **OTP verification**.  
✅ **JWT-based Authentication:** Ensures secure user access and token validation.  

### 🌐 **User Experience & Interface**
✅ **Active Users Display:** See online users in real-time.  
✅ **Custom Themes:** Switch between various color themes.  
✅ **Profile Customization:** Edit your profile and update details with ease.  
✅ **Global State Management:** Efficient state handling using **Zustand**.  

---

## 🛠️ Tech Stack

### 📌 Frontend:
- React.js
- TailwindCSS
- Daisy UI

### 📌 Backend:
- Node.js
- Express.js

### 📌 Database:
- MongoDB (Mongoose)

### 📌 Real-Time Communication:
- Socket.io

### 📌 Authentication:
- JSON Web Token (JWT)
- OTP-based authentication

### 📌 State Management:
- Zustand

### 📌 Deployment:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/fromsaurav/Chatty.git
cd Chatty
```

### 2️⃣ Install Dependencies (Frontend & Backend) at Once
Run the following command in the root directory to install dependencies for both frontend and backend simultaneously:
```sh
npm run install:all
```

### 3️⃣ Configure Environment Variables

#### Backend (.env file in backend directory):
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
SOCKET_IO_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173
```

#### Frontend (for development):
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

#### Frontend (for production):
When deploying to Vercel, add these environment variables in the Vercel dashboard:
```env
VITE_API_URL=https://chatty-tn4i.onrender.com/api
VITE_SOCKET_URL=https://chatty-tn4i.onrender.com
```

### 4️⃣ Run the Project Locally

#### Start the Backend:
```sh
cd backend
npm run start
# or
nodemon index
```

#### Start the Frontend:
```sh
cd frontend
npm run dev
```

### 5️⃣ Open in Browser
```sh
http://localhost:5173
```

## 🚀 Deployment Instructions

### Backend Deployment (Render):
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
4. Add all environment variables from your backend `.env` file
5. Set `FRONTEND_URL` to your Vercel frontend URL

### Frontend Deployment (Vercel):
1. Import your project into Vercel
2. Configure the following environment variables:
   - `VITE_API_URL`: Your Render backend URL + `/api`
   - `VITE_SOCKET_URL`: Your Render backend URL
3. Deploy your application

---

## 🔥 Expected Impact
✅ **Enhanced User Engagement:** Real-time chat, multimedia support, and interactive features improve user experience.  
✅ **Improved Security:** OTP authentication and JWT-based authorization ensure data security.  
✅ **Seamless Communication:** Smooth and responsive UI with Socket.io for real-time updates.  
✅ **Customization & Control:** Users can personalize themes, manage messages, and customize their profiles.  
✅ **Scalability:** Built on the MERN stack, allowing easy scalability for future enhancements.  

---

## 🤝 Contribution
We welcome contributions! To contribute:
1. **Fork** the repository.
2. **Create a feature branch** (`git checkout -b feature-name`).
3. **Commit your changes** (`git commit -m "Added new feature"`).
4. **Push to your branch** (`git push origin feature-name`).
5. **Create a Pull Request**.

---

## 📩 Contact  
🔗 **GitHub:** [fromsaurav](https://github.com/fromsaurav)  
📧 **Email:** telisaurav44@gmail.com  
💼 **LinkedIn:** [Saurav Teli](https://www.linkedin.com/in/saurav-teli-89a27a263)  

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 🌟 Stay Connected
📧 Have any suggestions or feedback? Feel free to reach out!

### 🎯 Let's Chat in Style with Chatty! 🚀🔥