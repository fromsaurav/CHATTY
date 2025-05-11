import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isSendingOtp: false,
  isVerifyingOtp: false,
  onlineUsers: [],
  socket: null,

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      if (res.data) get().connectSocket();
      return res.data;
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
      return null;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Step 1: Send OTP to user email
  sendOtp: async (email) => {
    set({ isSendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success(res.data.message || "Verification email sent successfully");
      return true;
    } catch (error) {
      console.error("Error in sendOtp:", error);
      toast.error(error.response?.data?.message || "Failed to send verification email");
      return false;
    } finally {
      set({ isSendingOtp: false });
    }
  },

  // Step 2: Complete signup with OTP
  verifyOtpAndSignUp: async (userData) => {
    set({ isVerifyingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/complete-signup", userData);
      set({ authUser: res.data });
      toast.success("Signup successful!");
      get().connectSocket();
      return true;
    } catch (error) {
      console.error("Error in verifyOtpAndSignUp:", error);
      toast.error(error.response?.data?.message || "Email verification failed");
      return false;
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  // Regular signup with password (no OTP)
  signupWithPassword: async (userData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", userData);
      set({ authUser: res.data });
      toast.success("Signup successful!");
      get().connectSocket();
      return true;
    } catch (error) {
      console.error("Error in signupWithPassword:", error);
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login User
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      console.error("Error in login:", error);
      toast.error(error.response?.data?.message || "Invalid email or password");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Google Authentication
  googleAuth: async (idToken) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google-auth", { idToken });
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      console.error("Error in googleAuth:", error);
      toast.error(error.response?.data?.message || "Google authentication failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout User
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      console.error("Error in logout:", error);
      toast.error(error.response?.data?.message || "Logout failed");
      return false;
    }
  },

  // Update Profile Picture
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      // Use FormData if profile picture is included
      let formData;
      if (data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();
        if (data.profilePicture) {
          formData.append("profilePic", data.profilePicture); // Corrected key to 'profilePic'
        }
        if (data.fullName) {
          formData.append("fullName", data.fullName);
        }
        // Add any other fields that might be needed
      }
      
      const res = await axiosInstance.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Connect to Socket.io
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    try {
      const newSocket = io(BASE_URL, {
        query: { userId: authUser._id },
        withCredentials: true,
      });
      
      newSocket.on("connect", () => {
        console.log("Socket connected");
        set({ socket: newSocket });
      });
      
      newSocket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
      
      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      // Handle reconnection
      newSocket.on("disconnect", () => {
        console.log("Socket disconnected, attempting to reconnect...");
      });

      return newSocket;
    } catch (error) {
      console.error("Error setting up socket:", error);
      return null;
    }
  },

  // Disconnect from Socket.io
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));