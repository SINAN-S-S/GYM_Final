import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/global.css";
import "./styles/variables.css";
import axios from "axios";

// --- GLOBAL FRONTEND API LOGGING & URL NORMALIZATION ---
axios.interceptors.request.use(request => {
  if (request.url) {
    // If VITE_BACKEND_URL was undefined or omitted at build time
    if (request.url.startsWith("undefined")) {
      request.url = request.url.replace(/^undefined/, "");
    }

    // In production (Vercel / live domain), normalize localhost or obsolete backend hosts
    // to same-origin relative path so Vercel serverless function /api routes work seamlessly
    if (typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      request.url = request.url.replace(/^https?:\/\/(localhost:5000|127\.0\.0\.1:5000|gym-final-u29p\.vercel\.app|gym-final-cvrc\.onrender\.com|gym-final-five\.vercel\.app)/, "");
    }

    // Clean up duplicate slashes after protocol (e.g. http://localhost:5000//api -> http://localhost:5000/api)
    request.url = request.url.replace(/([^:])\/\/+/g, '$1/');
  }

  // Automatically attach Bearer token from localStorage if present and not already attached
  if (typeof window !== "undefined" && window.localStorage) {
    const token = localStorage.getItem("token");
    if (token && !request.headers?.["Authorization"] && !request.headers?.["authorization"]) {
      if (!request.headers) request.headers = {};
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  console.log(`\n[Frontend]  API Request: ${request.method?.toUpperCase()} ${request.url}`);
  if (request.data) {
    console.log('[Frontend]  Request Payload:', request.data);
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
