import jwtDecode from 'jwt-decode';

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = tokens => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', tokens);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getDecodedToken = () => {
  const token = getToken();
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }
  return null;
};

export const getUserRole = () => {
  const decodedToken = getDecodedToken();
  return decodedToken?.role || null;
};

export const getUserId = () => {
  const decodedToken = getDecodedToken();
  return decodedToken ? decodedToken.userId : null;
};