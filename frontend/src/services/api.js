import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor de request - Agregar JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de response - Manejar errores globales
api.interceptors.response.use(
  response => response,
  error => {
    // Solo redirigir a login si:
    // 1. Es un error 401
    // 2. NO es la ruta de login (para evitar loops)
    // 3. El mensaje indica token inválido o expirado
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login' || currentPath === '/auth' || currentPath === '/register';
      const errorMessage = error.response?.data?.message || '';
      const isTokenError = errorMessage.includes('token') || errorMessage.includes('autenticación') || errorMessage.includes('sesión');

      // Solo limpiar y redirigir si no estamos en login y es un error de token
      if (!isLoginPage && (isTokenError || !localStorage.getItem('token'))) {
        console.warn('Sesión expirada o token inválido. Redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Evitar redirección si ya estamos en una página pública
        const publicPaths = ['/', '/catalog', '/product'];
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

        if (!isPublicPath) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
