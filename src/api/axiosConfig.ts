import axios from 'axios';
import { signOut } from 'next-auth/react';
import { API_BASE_URL } from 'src/configs/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
