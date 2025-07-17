import { useState, useEffect } from 'react';
import { getCurrentUserProfile, uploadUserProfilePicture } from '../services/authService.js';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfilePicture = async (file) => {
    try {
      const updatedProfile = await uploadUserProfilePicture(file);
      setProfile(updatedProfile);
    } catch (err) {
      setError('Failed to update profile picture.');
    }
  };

  return { profile, loading, error, updateProfilePicture };
}