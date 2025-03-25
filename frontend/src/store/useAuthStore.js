import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

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

  // ✅ Check if user is authenticated
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      if (res.data) get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Step 1: Send OTP to user email
  sendOtp: async (email) => {
    set({ isSendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success(res.data.message || "OTP sent successfully");
    } catch (error) {
      console.log("Error in sendOtp:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      set({ isSendingOtp: false });
    }
  },

  // ✅ Step 2: Verify OTP & Signup (Replaces signup function)
  verifyOtpAndSignup: async (userData) => {
    set({ isVerifyingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp-signup", userData);
      set({ authUser: res.data });
      toast.success("Signup successful!");
      get().connectSocket();
    } catch (error) {
      console.log("Error in verifyOtpAndSignup:", error);
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  // ✅ Login User
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.log("Error in login:", error);
      toast.error(error.response?.data?.message || "No User Found !!");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout User
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout:", error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // ✅ Update Profile Picture
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

   // ✅ Connect to Socket.io
   connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });
    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },


  // ✅ Disconnect from Socket.io
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
