import axios from 'axios';

// Get API URL - use environment variable or default to backend URL
// IMPORTANT: This must be the full backend URL since client-side requests
// can't use Next.js rewrites
const getApiUrl = () => {
  // In browser, use the environment variable or default backend URL
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://auto-forge-backend.vercel.app';
  }
  // Server-side can use rewrites
  return process.env.NEXT_PUBLIC_API_URL || 'https://auto-forge-backend.vercel.app';
};

const API_URL = getApiUrl();

// Log API URL for debugging (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔗 API Client initialized');
  console.log('📍 API URL:', API_URL);
  console.log('🌐 Environment variable:', process.env.NEXT_PUBLIC_API_URL || 'Not set (using default)');
  console.log('🔍 Window origin:', window.location.origin);
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20 second timeout
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

