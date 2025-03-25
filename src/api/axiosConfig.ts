import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window === 'undefined') { // Côté serveur uniquement
      const { auth } = await import('@/auth');
      const session = await auth();
      if (session?.accessToken) {
        config.headers.Authorization = `bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
