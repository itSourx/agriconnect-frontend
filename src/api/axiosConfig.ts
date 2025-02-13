
import axios from 'axios';

const api = axios.create({
  baseURL: 'YOUR_API_BASE_URL', // Replace with your API's base URL
  timeout: 10000, // Optional: Set a timeout for requests (in milliseconds)
  headers: {
    'Content-Type': 'application/json', // Optional: Set default headers
    // You can add more default headers here,like Authorization if needed
  },
});

// Optional: Add request interceptors
api.interceptors.request.use(
  (config) => {
    // Do something before request is sent (e.g., add authentication tokens)
    // For example:
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {...config.headers, Authorization: `Bearer ${token}`};
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error
);
  }
);



export default api;
