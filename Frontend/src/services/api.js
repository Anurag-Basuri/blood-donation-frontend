import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	withCredentials: true,
});

// Public client for requests that don't require authentication
const publicClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	withCredentials: true,
});

// Interceptor to add authentication token to requests
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken'); // Assuming you store the token in localStorage
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		// Handle request errors
		return Promise.reject(error);
	}
);

// Interceptor to handle errors globally
axiosInstance.interceptors.response.use(
	(response) => {
		// If the response is successful, just return it
		return response;
	},
	(error) => {
		// Handle errors globally
		if (error.response) {
			// You can customize this part based on your application's needs
			console.error('API error occurred:', error.response.data);	
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
