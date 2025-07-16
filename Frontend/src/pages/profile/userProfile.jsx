import React from 'react';
import { motion } from 'framer-motion';
import ProfileHeader from './ProfileHeader';
import DonationPreferences from './DonationPreferences';
import DonationHistory from './DonationHistory';
import ProfileActions from './ProfileActions';

const userProfile = ({ user, isCurrentUser, loading, error }) => {
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
      <ProfileHeader user={user} isCurrentUser={isCurrentUser} />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {user.bloodDonationHistory?.length > 0 && (
            <DonationHistory history={user.bloodDonationHistory} />
          )}
        </div>
        
        <div className="space-y-6">
          {user.donationPreferences?.preferredCenter && (
            <DonationPreferences preferences={user.donationPreferences} />
          )}
          
          {isCurrentUser && (
            <ProfileActions />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default userProfile;