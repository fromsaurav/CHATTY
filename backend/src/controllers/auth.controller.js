import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import { sendOTPEmail } from "../lib/emailService.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { auth } from "../lib/firebaseConfig.js";

//   error handling to all controllers
const handleControllerError = (error, res, controllerName) => {
  console.error(`Error in ${controllerName}:`, error);
  
  // Check if it's a MongoDB connection error
  if (error.name === 'MongooseServerSelectionError' || 
      error.message.includes('buffering timed out') ||
      error.message.includes('ECONNREFUSED')) {
    return res.status(503).json({ 
      message: "Database connection issue. Please try again later." 
    });
  }
  
  // Handle Firebase-specific errors
  if (error.code) {
    switch(error.code) {
      case 'auth/email-already-in-use':
        return res.status(400).json({ message: "Email is already in use." });
      case 'auth/invalid-email':
        return res.status(400).json({ message: "Email address is invalid." });
      case 'auth/weak-password':
        return res.status(400).json({ message: "Password is too weak." });
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return res.status(400).json({ message: "Invalid email or password." });
      case 'auth/invalid-credential':
        return res.status(400).json({ message: "Invalid credentials." });
      case 'auth/operation-not-allowed':
        return res.status(400).json({ message: "Operation not allowed." });
      case 'auth/unauthorized-continue-uri':
        return res.status(400).json({ message: "The domain of the continue URL is not authorized." });
      default:
        return res.status(400).json({ message: error.message });
    }
  }
  
  return res.status(500).json({ message: "Internal Server Error" });
};

// Function to send OTP to email
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    
    // Check if user already exists in your database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });
    
    // Save OTP to database
    const newOTP = new OTP({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    
    await newOTP.save();
    
    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "OTP sent to your email. Please check your inbox and enter the 6-digit code.",
      // In development, you can include the preview URL
      ...(process.env.NODE_ENV === "development" && { previewUrl: emailResult.previewUrl })
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    handleControllerError(error, res, "sendOtp controller");
  }
};

// Complete signup with email OTP
export const completeSignupWithOtp = async (req, res) => {
  const { email, fullName, password, otp } = req.body;
  
  try {
    if (!email || !fullName || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    if (otp.length !== 6) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }
    
    // Find and verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    
    // Check if user already exists (double-check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    
    // Create user in database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    
    await newUser.save();
    
    // Clean up used OTP
    await OTP.deleteMany({ email });
    
    // Emit socket event for new user registration
    io.emit("newUserRegistered", {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
    
    // Generate token for the new user
    generateToken(newUser._id, res, { httpOnly: true, secure: true, sameSite: "strict" });
    
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    handleControllerError(error, res, "completeSignupWithOtp controller");
  }
};

// Sign up with email and password
export const signupWithPassword = async (req, res) => {
  const { fullName, email, password } = req.body;
  
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    // Check if user already exists in your database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Also create user in your database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      firebaseUid: userCredential.user.uid
    });
    
    await newUser.save();
    
    // Emit socket event for new user registration
    io.emit("newUserRegistered", {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
    
    // Generate token for the new user
    generateToken(newUser._id, res, { httpOnly: true, secure: true, sameSite: "strict" });
    
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    handleControllerError(error, res, "signupWithPassword controller");
  }
};

// Login with email and password
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user in your database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No User Found !!" });
    }
    
    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect Password !!" });
    }
    
    // Authenticate with Firebase
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (firebaseError) {
      console.error("Firebase authentication error:", firebaseError);
      // Continue with local authentication if Firebase auth fails
    }
    
    // Generate JWT token
    generateToken(user._id, res, { httpOnly: true, secure: true, sameSite: "strict" });
    
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    handleControllerError(error, res, "login controller");
  }
};

// Google Sign In (Login) - Only for existing users
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  
  try {
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }
    
    // Create Google credential
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase with Google credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const { user } = userCredential;
    
    // Check if user exists in database
    const dbUser = await User.findOne({ email: user.email });
    
    if (!dbUser) {
      return res.status(400).json({ 
        message: "No account found with this Google account. Please sign up first." 
      });
    }
    
    // Update Firebase UID if user exists but doesn't have it
    if (!dbUser.firebaseUid) {
      dbUser.firebaseUid = user.uid;
      if (user.photoURL && !dbUser.profilePic) {
        dbUser.profilePic = user.photoURL;
      }
      await dbUser.save();
    }
    
    // Generate JWT token
    generateToken(dbUser._id, res, { httpOnly: true, secure: true, sameSite: "strict" });
    
    res.status(200).json({
      _id: dbUser._id,
      fullName: dbUser.fullName,
      email: dbUser.email,
      profilePic: dbUser.profilePic,
    });
  } catch (error) {
    handleControllerError(error, res, "googleLogin controller");
  }
};

// Google Sign Up - Only for new users
export const googleSignup = async (req, res) => {
  const { idToken } = req.body;
  
  try {
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }
    
    // Create Google credential
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase with Google credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const { user } = userCredential;
    
    // Check if user already exists in database
    const existingUser = await User.findOne({ email: user.email });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Account with this Google email already exists. Please login instead." 
      });
    }
    
    // Create new user in database
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const newUser = new User({
      fullName: user.displayName || 'Google User',
      email: user.email,
      password: hashedPassword, // Random secure password
      profilePic: user.photoURL || '',
      firebaseUid: user.uid
    });
    
    await newUser.save();
    
    // Emit socket event for new user registration
    io.emit("newUserRegistered", {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
    
    // Generate JWT token
    generateToken(newUser._id, res, { httpOnly: true, secure: true, sameSite: "strict" });
    
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    handleControllerError(error, res, "googleSignup controller");
  }
};

// 📌 Logout User
export const logout = (req, res) => {
  try {
    // Clear JWT cookie
    res.cookie("jwt", "", { httpOnly: true, secure: true, sameSite: "strict", expires: new Date(0) });
    
    // Note: Firebase client-side logout should be handled in the frontend
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    handleControllerError(error, res, "logout controller");
  }
};

// 📌 Update Profile Picture
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Check User Authentication
export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // 🔹 Return the authenticated user's details
    res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      profilePic: req.user.profilePic,
    });

  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};