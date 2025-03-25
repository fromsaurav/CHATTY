import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add retry logic for database connection issues
      let attempts = 0;
      const maxAttempts = 3;
      let user = null;
      
      while (attempts < maxAttempts && !user) {
        try {
          user = await User.findById(decoded.userId).select("-password");
          
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          
          req.user = user;
          next();
          return;
        } catch (dbError) {
          attempts++;
          console.log(`Database query attempt ${attempts} failed: ${dbError.message}`);
          
          if (attempts >= maxAttempts) {
            throw dbError;
          }
          
          // Wait before retrying (exponential backoff)
          const delay = 1000 * Math.pow(2, attempts - 1); // 1s, 2s, 4s...
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (jwtError) {
      console.log("JWT verification error:", jwtError.message);
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error.message);
    
    // Provide more specific error messages based on error type
    if (error.name === 'MongooseServerSelectionError' || 
        error.message.includes('buffering timed out') ||
        error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        message: "Database connection issue. Please try again later." 
      });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};