import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import{Otp} from "../models/otpSchema.js";
import { sendEmail } from "../lib/emailService.js";
import crypto from "crypto";
import cloudinary from "../lib/cloudinary.js";


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
  
  return res.status(500).json({ message: "Internal Server Error" });
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if an OTP was recently sent (cooldown of 1 min)
    const lastOtp = await Otp.findOne({ email });
    if (lastOtp && Date.now() - lastOtp.createdAt < 60 * 1000) {
      return res.status(429).json({ message: "Please wait before requesting a new OTP" });
    }

    // Generate & Hash OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 mins

    await Otp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, otpExpires, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    handleControllerError(error, res, "sendOtp controller");
  }
};


export const verifyOtpAndSignup = async (req, res) => {
  const { fullName, email, password, otp } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 🔹 Retrieve OTP record
    const otpRecord = await Otp.findOne({ email });

    // 🔹 Validate OTP record
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 🔹 Compare the hashed OTP
    const isOtpValid = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // 🔹 Hash password & Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 🔹 Clean up OTP after successful signup
    await Otp.deleteMany({ email });

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });

  } catch (error) {
    handleControllerError(error, res, "verifyOtpAndSignup controller");
  }
};


// 📌 Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "No User Found !!" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Incorrect Password !!" });

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

// 📌 Logout User
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { httpOnly: true, secure: true, sameSite: "strict", expires: new Date(0) });
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