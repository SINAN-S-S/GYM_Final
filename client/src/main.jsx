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

    // In production (Vercel / live domain), if the bundle has hardcoded localhost:5000,
    // reroute to same-origin relative path so Vercel serverless function /api routes work seamlessly
    if (typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      request.url = request.url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, "");
    }

    // Clean up duplicate slashes after protocol (e.g. http://localhost:5000//api -> http://localhost:5000/api)
    request.url = request.url.replace(/([^:])\/\/+/g, '$1/');
  }

  console.log(`\n[Frontend]  API Request: ${request.method?.toUpperCase()} ${request.url}`);
  if (request.data) {
    console.log('[Frontend]  Request Payload:', request.data);
  }
  return request;
});

axios.interceptors.response.use(response => {
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
