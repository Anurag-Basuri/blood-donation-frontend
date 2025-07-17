import React from 'react';
import { Mail, Phone } from 'lucide-react';

const ProfileHeader = ({ user, isCurrentUser }) => {
  // Fallback to initials if no profile photo
  const getInitials = () => {
    return user.name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {user.profilePhoto ? (
        <img 
          src={user.profilePhoto} 
          alt={user.name} 
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
        />
      ) : (
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-red-100 text-red-800 text-4xl font-bold border-4 border-white shadow-lg">
          {getInitials()}
        </div>
      )}
      
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
        
        <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Blood Group: {user.bloodGroup}
          </span>
          
          {user.age && (
            <span className="text-gray-600 text-sm">
              {user.age} years
            </span>
          )}
          
          {user.gender && (
            <span className="text-gray-600 text-sm">
              {user.gender}
            </span>
          )}
        </div>
        
        {!isCurrentUser && (
          <div className="mt-4 flex gap-3 justify-center md:justify-start">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Phone size={16} />
              Contact
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Mail size={16} />
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;