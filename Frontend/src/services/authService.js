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
};

// Function to register user
export const userRegister = async (userName, fullName, email, phone, dateOfBirth, gender, bloodType, lastDonationDate, address, password) => {
    const response = await publicClient.post('/users/register', {userName, fullName, email, phone, dateOfBirth, gender, bloodType, lastDonationDate, address, password});
    const { token } = response.data;

    setToken(token);
    return response.data; // Return user data or any other relevant info
}

// Function to register hospital
export const hospitalRegister = async (name, email, address, contactPerson, emergencyContact, specialties, registrationNumber) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('contactPerson', contactPerson);
    formData.append('emergencyContact', emergencyContact);
    formData.append('specialties', specialties);
    formData.append('registrationNumber', registrationNumber);

    const response = await publicClient.post('/hospitals/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    const { token } = response.data;

    setToken(token);
    return response.data; // Return hospital data or any other relevant info
}

// Function to register NGO
export const ngoRegister = async (name, email, address, contactPerson, regNumber, affiliation, establishedYear, license, password) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('contactPerson', contactPerson);
    formData.append('regNumber', regNumber);
    formData.append('affiliation', affiliation);
    formData.append('establishedYear', establishedYear);
    formData.append('license', license);
    formData.append('password', password);

    const response = await publicClient.post('/ngos/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    const { token } = response.data;

    setToken(token);
    return response.data; // Return NGO data or any other relevant info
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

// 