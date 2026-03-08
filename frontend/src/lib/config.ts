// Configuration helper for API and Socket URLs
// Works both locally and in production

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5005";
