// lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "production" ? "https://chatty-tn4i.onrender.com/api" : "/api",
  withCredentials: true,
});