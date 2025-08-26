import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
import { seedDemoUsersIfNeeded } from "./lib/seedDemoUsers.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Increase request size limits to handle large files
app.use(express.json({ limit: "100mb" }));  // Allow JSON payloads up to 100MB
app.use(express.urlencoded({ extended: true, limit: "100mb" })); // Allow URL-encoded data up to 100MB

app.use(cookieParser());

// Update CORS to allow requests from your Vercel frontend
app.use(
  cors({
    origin: ["https://chatty-eight-zeta.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Simple route to verify the API is working
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

server.listen(PORT, async () => {
  console.log("server is running on PORT:" + PORT);
  await connectDB();
  
  // Seed demo users for production
  await seedDemoUsersIfNeeded();
});