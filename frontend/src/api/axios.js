import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Network error (server down, CORS, etc.)
            return Promise.reject({
                response: {
                    data: { message: "Something went wrong. Please try again." }
                }
            });
        }
        
        if (error.response.status === 401) {
            // Unauthenticated
            localStorage.removeItem('token');
            // Allow redirect but we might need a subtle way. window.location is safe.
            window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(error);
    }
);

export default api;
