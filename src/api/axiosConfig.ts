import axios from 'axios';
import { signOut } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://agriconnect-bc17856a61b8.herokuapp.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      await signOut({
        redirect: true,
        callbackUrl: '/auth/login'
      });
    }
    return Promise.reject(error);
  }
);

export default api;
