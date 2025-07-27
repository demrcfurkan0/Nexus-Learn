import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', 
});

apiClient.interceptors.request.use(
  (config) => {
    // localStorage'dan token'ı al
    const token = localStorage.getItem('nexus_token');
    if (token) {
      // Eğer token varsa, isteğin header'larına ekle
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;