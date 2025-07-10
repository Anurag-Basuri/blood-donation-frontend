import { createContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/user/me'); // adjust as needed
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/user/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
