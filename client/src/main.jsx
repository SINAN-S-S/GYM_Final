import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/global.css";
import "./styles/variables.css";
import axios from "axios";

// --- GLOBAL FRONTEND API LOGGING & URL NORMALIZATION ---
const DEFAULT_PROD_BACKEND = "https://gym-final-3uya.vercel.app";
const DEFAULT_DEV_BACKEND = "http://localhost:5000";

const isLocalHost = () => {
  if (typeof window === "undefined" || !window.location) return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
};

const getActiveBackend = () => {
  const isLocal = isLocalHost();
  const configured = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");

  // If running locally in dev, use configured dev backend or default local port 5000
  if (isLocal) {
    return configured || DEFAULT_DEV_BACKEND;
  }

  // In production (e.g. gym-final-lake.vercel.app or any live deployment):
  // Never route to localhost, 127.0.0.1, or obsolete legacy backends
  const isObsolete = !configured || /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five|gym-final-qsuh/.test(configured);
  if (isObsolete) {
    return DEFAULT_PROD_BACKEND;
  }
  return configured;
};

axios.interceptors.request.use(request => {
  const activeBackend = getActiveBackend();
  const isLocal = isLocalHost();

  if (request.url) {
    // If VITE_BACKEND_URL was undefined or omitted at build time
    if (request.url.startsWith("undefined")) {
      request.url = request.url.replace(/^undefined/, "");
    }

    // In production, force all localhost, 127.0.0.1, and obsolete backend URLs to the live backend
    if (!isLocal) {
      request.url = request.url.replace(
        /^https?:\/\/(localhost(:[0-9]+)?|127\.0\.0\.1(:[0-9]+)?|gym-final-u29p\.vercel\.app|gym-final-cvrc\.onrender\.com|gym-final-five\.vercel\.app|gym-final-qsuh\.vercel\.app)/,
        activeBackend
      );
    } else {
      // In local dev, replace obsolete remote domains with active backend
      request.url = request.url.replace(
        /^https?:\/\/(gym-final-u29p\.vercel\.app|gym-final-cvrc\.onrender\.com|gym-final-five\.vercel\.app|gym-final-qsuh\.vercel\.app)/,
        activeBackend
      );
    }

    // If request URL is relative (/api/...), prefix with activeBackend
    if (request.url.startsWith("/api")) {
      request.url = `${activeBackend}${request.url}`;
    }

    // Clean up duplicate slashes after protocol (e.g. https://domain.vercel.app//api -> https://domain.vercel.app/api)
    request.url = request.url.replace(/([^:])\/\/+/g, '$1/');
  }

  // Ensure cross-origin credentials (cookies, authorization headers) are sent to backend
  request.withCredentials = true;

  // Automatically attach Bearer token from localStorage if present and not already attached
  if (typeof window !== "undefined" && window.localStorage) {
    const token = localStorage.getItem("token");
    if (token && !request.headers?.["Authorization"] && !request.headers?.["authorization"]) {
      if (!request.headers) request.headers = {};
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  console.log(`\n[Frontend] API Request: ${request.method?.toUpperCase()} ${request.url}`);
  if (request.data) {
    console.log('[Frontend] Request Payload:', request.data);
  }
  return request;
});

axios.interceptors.response.use(response => {
  // Catch SPA fallback HTML responses on /api/ endpoints
  const contentType = response.headers?.['content-type'] || '';
  if (
    response.config?.url?.includes('/api/') &&
    contentType.includes('text/html') &&
    typeof response.data === 'string' &&
    response.data.includes('<!doctype html')
  ) {
    console.error(
      `[Frontend] API Configuration Error: Endpoint ${response.config.url} returned HTML index page instead of JSON. ` +
      `Ensure VITE_BACKEND_URL is set in Vercel to your deployed backend URL.`
    );
    return Promise.reject(
      new Error(`API endpoint ${response.config.url} returned HTML instead of JSON. Check VITE_BACKEND_URL setting in Vercel.`)
    );
  }

  console.log(`[Frontend]  API Response: ${response.status} from ${response.config.url}`);
  return response;
}, error => {
  console.log(`[Frontend]  API Error:`, error.response?.status, error.message);
  return Promise.reject(error);
});
// -----------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
