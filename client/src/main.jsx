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

const getActiveBackend = () => {
  const isLocal = typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  if (isLocal) {
    return DEFAULT_DEV_BACKEND;
  }
  const configured = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
  const isObsolete = /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five/.test(configured);
  if (!configured || isObsolete) {
    return DEFAULT_PROD_BACKEND;
  }
  return configured;
};

axios.interceptors.request.use(request => {
  const activeBackend = getActiveBackend();
  const isLocal = typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (request.url) {
    // If VITE_BACKEND_URL was undefined or omitted at build time
    if (request.url.startsWith("undefined")) {
      request.url = request.url.replace(/^undefined/, "");
    }

    if (!isLocal) {
      // In production (e.g. on https://gym-final-lake.vercel.app), route all API requests to the deployed backend
      request.url = request.url.replace(
        /^https?:\/\/(localhost:5000|127\.0\.0\.1:5000|gym-final-u29p\.vercel\.app|gym-final-cvrc\.onrender\.com|gym-final-five\.vercel\.app)/,
        activeBackend
      );

      // If request URL is relative (/api/...), prefix with activeBackend
      if (request.url.startsWith("/api")) {
        request.url = `${activeBackend}${request.url}`;
      }
    } else {
      // In local development, ensure requests target localhost:5000
      request.url = request.url.replace(
        /^https?:\/\/(gym-final-qsuh\.vercel\.app|gym-final-3uya\.vercel\.app)/,
        DEFAULT_DEV_BACKEND
      );
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
