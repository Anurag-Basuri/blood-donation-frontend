import { axiosInstance, publicClient } from "./api.js";
import {
    getToken,
    setToken,
    removeToken
} from "../utils/storage.js";

// Function to handle authentication errors globally
const handleAuthError = (error) => {
	if (error.response) {
		const { status } = error.response;

		if (status === 401) {
			removeToken();
			window.location.href = '/login'; // Or use router redirect
		}
	}
	return Promise.reject(error);
};

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        handleAuthError(error);
        return Promise.reject(error);
    }
);

// Function to check if the user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    return !!token; // Returns true if token exists, false otherwise
}

// Function to login user
export const userLogin = async (userName, email, phone, password) => {
    const response = await publicClient.post('/users/login', { userName, email, phone, password });
    const { token } = response.data;

    setToken(token);
    return response.data; // Return user data or any other relevant info
}

// Function to login hospital
export const hospitalLogin = async (email, password) => {
    const response = await publicClient.post('/hospitals/login', { email, password });
    const { token } = response.data;

    setToken(token);
    return response.data; // Return hospital data or any other relevant info
}

// Function to login NGO
export const ngoLogin = async (email, password) => {
    const response = await publicClient.post('/ngos/login', { email, password });
    const { token } = response.data;

    setToken(token);
    return response.data; // Return NGO data or any other relevant info
}