import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const demoUsers = [
  {
    fullName: "Alex Johnson",
    email: "alex.johnson.demo@chatty.com",
    profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    isDemo: true
  },
  {
    fullName: "Emma Williams",
    email: "emma.williams.demo@chatty.com", 
    profilePic: "https://images.unsplash.com/photo-1494790108755-2616b68bd37d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    isDemo: true
  },
  {
    fullName: "Michael Chen",
    email: "michael.chen.demo@chatty.com",
    profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    isDemo: true
  },
  {
    fullName: "Sophie Martinez",
    email: "sophie.martinez.demo@chatty.com",
    profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    isDemo: true
  },
  {
    fullName: "David Thompson",
    email: "david.thompson.demo@chatty.com", 
    profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    isDemo: true
  }
];

export const seedDemoUsersIfNeeded = async () => {
  try {
    // Check if demo users already exist
    const existingDemoUsers = await User.find({ isDemo: true });
    
    if (existingDemoUsers.length >= 5) {
      console.log("✅ Demo users already exist");
      return;
    }

    console.log("🌱 Creating demo users for production...");
    
    // Remove existing demo users first
    if (existingDemoUsers.length > 0) {
      await User.deleteMany({ isDemo: true });
    }
    
    // Create demo users
    const hashedPassword = await bcrypt.hash("demo123456", 10);
    
    const demoUserPromises = demoUsers.map(async (userData) => {
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      return user;
    });

    await Promise.all(demoUserPromises);
    console.log("🎉 Demo users created successfully!");

  } catch (error) {
    console.error("❌ Error creating demo users:", error);
  }
};