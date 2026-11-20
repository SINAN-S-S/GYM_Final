const DEFAULT_PROD_BACKEND = "https://gym-final-3uya.vercel.app";

const getBackendBase = () => {
  const configured = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
  const isObsolete = /gym-final-u29p|onrender|gym-final-five|gym-final-qsuh/.test(configured);
  if (configured && !isObsolete) {
    return configured;
  }
  return DEFAULT_PROD_BACKEND;
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