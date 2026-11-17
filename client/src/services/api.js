const rawBaseURL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
const isProductionRemote = typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const baseURL = (isProductionRemote && rawBaseURL.includes("localhost:5000")) ? "" : rawBaseURL;
const API = `${baseURL}/api`;

export const registerUser = async (data) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};