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

// Function to refresh the authentication token
export const refreshAuthToken = async () => {
    const response = await axiosInstance.post('/users/refresh-token');
    const { token } = response.data;
    setToken(token);
    return response.data;
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

// Function to logout user
export const userLogout = async () => {
    await axiosInstance.post('/users/logout');
    removeToken();
};

// Function to logout hospital
export const hospitalLogout = async () => {
    await axiosInstance.post('/hospitals/logout');
    removeToken();
};

// Function to logout NGO
export const ngoLogout = async () => {
    await axiosInstance.post('/ngos/logout');
    removeToken();
};

// Function to get current user profile
export const getCurrentUserProfile = async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
};

// Function to get current hospital profile
export const getCurrentHospitalProfile = async () => {
    const response = await axiosInstance.get('/hospitals/me');
    return response.data;
};

// Function to get current NGO profile
export const getCurrentNGOProfile = async () => {
    const response = await axiosInstance.get('/ngos/me');
    return response.data;
};

// Upload profile picture for user
export const uploadUserProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post('/users/upload-profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data; // Return updated user profile data
};

// Upload profile picture for hospital
export const uploadHospitalProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post('/hospitals/upload-profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data; // Return updated hospital profile data
};
