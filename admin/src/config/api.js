/**
 * Centralized API Configuration for Admin Console
 * Uses VITE_API_URL environment variable in production, falls back to localhost:5001 in development.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");
