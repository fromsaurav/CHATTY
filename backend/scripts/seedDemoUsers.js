import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

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

const seedDemoUsers = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if demo users already exist
    const existingDemoUsers = await User.find({ isDemo: true });
    console.log(`📊 Found ${existingDemoUsers.length} existing demo users`);

    if (existingDemoUsers.length >= 5) {
      console.log("✅ Demo users already exist, skipping creation");
      return;
    }

    // Remove existing demo users first
    if (existingDemoUsers.length > 0) {
      await User.deleteMany({ isDemo: true });
      console.log("🗑️  Removed existing demo users");
    }

    console.log("\n🌱 Creating demo users...");
    
    // Create demo users
    const hashedPassword = await bcrypt.hash("demo123456", 10);
    
    const demoUserPromises = demoUsers.map(async (userData) => {
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`✅ Created demo user: ${userData.fullName}`);
      return user;
    });

    await Promise.all(demoUserPromises);

    console.log("\n🎉 All demo users created successfully!");
    console.log("\n📝 Demo User Credentials:");
    console.log("Email: Any of the demo emails listed above");
    console.log("Password: demo123456");
    console.log("\n💡 These users will appear in everyone's contact list for testing purposes.");

  } catch (error) {
    console.error("❌ Error creating demo users:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the seeding
console.log("🚀 Starting demo user creation...");
seedDemoUsers();