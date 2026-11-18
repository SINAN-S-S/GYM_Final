const rawBaseURL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
const isProductionRemote = typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const isObsoleteHost = /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five/.test(rawBaseURL);
const baseURL = (isProductionRemote && isObsoleteHost) ? "" : rawBaseURL;
const API = `${baseURL}/api`;

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Backend API returned non-JSON response (${res.status}). Verify your backend is running and VITE_BACKEND_URL is set.`
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
      body: JSON.stringify(data),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Backend API returned non-JSON response (${res.status}). Verify your backend is running and VITE_BACKEND_URL is set.`
      );
    }
    return await res.json();
  } catch (err) {
    console.error("[Auth API] Login error:", err.message);
    throw err;
  }
};