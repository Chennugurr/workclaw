import { redirect } from 'next/navigation';
import Axios from 'axios';
import dispatch from '@/store/dispatch';
import { ACTIONS } from '@/store/constants';

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const publicAxios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Function to check if token is expired or about to expire
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime + 10;
  } catch {
    return true;
  }
};

// Function to handle token refresh
const handleTokenRefresh = async (throwError = false) => {
  try {
    const token = localStorage.getItem(`@app/ls/rft`);
    if (throwError && !token) throw new Error(`No refresh token found`);

    const res = await publicAxios.post(`/auth/refresh-token`, {
      token,
    });
    const { accessToken, refreshToken } = res.data.data;

    localStorage.setItem('@app/ls/ast', accessToken);
    localStorage.setItem('@app/ls/rft', refreshToken);

    return accessToken;
  } catch (error) {
    console.error(`Failed to refresh token:`, error);
    // If token refresh fails, clear tokens and dispatch logout action
    localStorage.removeItem('@app/ls/ast');
    localStorage.removeItem('@app/ls/rft');
    localStorage.removeItem('@app/ls/store');
    dispatch({ type: ACTIONS.USER.LOGOUT });
  }
};

// Request interceptor
axios.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('@app/ls/ast');
    if (token && isTokenExpired(token)) {
      // Token is expired or about to expire, refresh it before sending the request
      const accessToken = await handleTokenRefresh();
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = await handleTokenRefresh(true);
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default axios;
