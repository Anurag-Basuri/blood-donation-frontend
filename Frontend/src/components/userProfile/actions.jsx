import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Lock, Bell } from 'lucide-react';

const ProfileActions = () => {
  const actions = [
    { icon: Edit, label: 'Edit Profile' },
    { icon: Lock, label: 'Change Password' },
    { icon: Bell, label: 'Notification Settings' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ x: 5 }}
            className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <action.icon className="text-gray-700" size={18} />
            <span>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ProfileActions;