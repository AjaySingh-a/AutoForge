import axios from 'axios';

// Use relative URL to leverage Next.js rewrites (proxies through frontend domain)
// This avoids CORS issues completely
const API_URL = typeof window !== 'undefined' 
  ? '' // Use relative URLs in browser (Next.js rewrites will handle it)
  : (process.env.NEXT_PUBLIC_API_URL || 'https://auto-forge-backend.vercel.app');

// Log API URL for debugging (only in browser)
if (typeof window !== 'undefined') {
  console.log('API Client initialized with URL:', API_URL || 'relative (using Next.js rewrites)');
  console.log('NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
  console.log('Window location:', window.location.origin);
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

