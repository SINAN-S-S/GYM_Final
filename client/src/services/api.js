const DEFAULT_BACKEND_URL = "https://gym-final-qsuh.vercel.app";
const rawBaseURL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
const isProductionRemote = typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const isObsoleteHost = /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five/.test(rawBaseURL);
const backendBase = (isProductionRemote && (isObsoleteHost || !rawBaseURL)) ? DEFAULT_BACKEND_URL : (rawBaseURL || (isProductionRemote ? DEFAULT_BACKEND_URL : "http://localhost:5000"));
const API = `${backendBase}/api`;

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Backend API returned non-JSON response (${res.status}). Verify your backend is running at ${API}.`
      );
    }
    return await res.json();
  } catch (err) {
    console.error("[Auth API] Register error:", err.message);
    throw err;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Backend API returned non-JSON response (${res.status}). Verify your backend is running at ${API}.`
      );
    }
    return await res.json();
  } catch (err) {
    console.error("[Auth API] Login error:", err.message);
    throw err;
  }
};