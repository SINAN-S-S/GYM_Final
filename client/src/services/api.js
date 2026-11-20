const DEFAULT_PROD_BACKEND = "https://gym-final-3uya.vercel.app";
const DEFAULT_DEV_BACKEND = "http://localhost:5000";

const isLocalHost = () => {
  if (typeof window === "undefined" || !window.location) return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
};

const getBackendBase = () => {
  const isLocal = isLocalHost();
  const configured = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");

  if (isLocal) {
    return configured || DEFAULT_DEV_BACKEND;
  }

  const isObsolete = !configured || /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five|gym-final-qsuh/.test(configured);
  if (isObsolete) {
    return DEFAULT_PROD_BACKEND;
  }
  return configured;
};

const API = `${getBackendBase()}/api`;

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