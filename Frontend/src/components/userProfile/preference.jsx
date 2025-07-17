import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const DonationPreferences = ({ preferences }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferred Donation Center</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">{preferences.preferredCenter.name}</h3>
              <p className="text-gray-600 text-sm">{preferences.preferredCenter.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="text-red-600 flex-shrink-0" size={18} />
            <span className="text-gray-600 text-sm">{preferences.preferredCenter.contact}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
          View on Map
        </button>
      </div>
    </div>
  );
};

export default DonationPreferences;