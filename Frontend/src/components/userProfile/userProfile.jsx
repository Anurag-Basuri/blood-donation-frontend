import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProfileHeader from './ProfileHeader';
import DonationPreferences from './DonationPreferences';
import DonationHistory from './DonationHistory';
import ProfileActions from './ProfileActions';

// --- API helpers based on user.controller.js ---
const API_BASE = '/api/v1/users';

const fetchUserProfile = async userId => {
  const res = await fetch(`${API_BASE}/profile/${userId}`, { credentials: 'include' });
  const data = await res.json();
  return data?.data || null;
};

const fetchDonationHistory = async userId => {
  const res = await fetch(`${API_BASE}/history/${userId}`, { credentials: 'include' });
  const data = await res.json();
  return data?.data || [];
};

const fetchNotifications = async () => {
  const res = await fetch(`${API_BASE}/notifications`, { credentials: 'include' });
  const data = await res.json();
  return data?.data || [];
};

const UserProfile = ({ userId, isCurrentUser }) => {
  const [user, setUser] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUserProfile(userId), fetchDonationHistory(userId), fetchNotifications()])
      .then(([profile, history, notifs]) => {
        setUser(profile);
        setDonationHistory(history);
        setNotifications(notifs);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 sm:p-6"
    >
      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 space-y-2"
        >
          {notifications.map(notif => (
            <div
              key={notif._id || notif.id}
              className={`flex items-center gap-2 px-4 py-2 rounded shadow ${
                notif.type === 'WELCOME' ? 'bg-blue-50 text-blue-700' : 'bg-red-100 text-red-700'
              }`}
              role="alert"
              aria-live="polite"
            >
              <span className="font-semibold">{notif.type}</span>
              <span>
                {notif.data?.nextSteps
                  ? notif.data.nextSteps.join(', ')
                  : notif.message || notif.content}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      <ProfileHeader
        user={{
          name: user.fullName || user.userName,
          profilePhoto: user.profilePicture,
          bloodGroup: user.bloodType,
          age: user.dateOfBirth
            ? Math.floor((Date.now() - new Date(user.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))
            : undefined,
          gender: user.gender,
        }}
        isCurrentUser={isCurrentUser}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {donationHistory.length > 0 && <DonationHistory history={donationHistory} />}
        </div>

        <div className="space-y-6">
          {user.donationPreferences?.preferredCenter && (
            <DonationPreferences preferences={user.donationPreferences} />
          )}

          {isCurrentUser && <ProfileActions />}
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
