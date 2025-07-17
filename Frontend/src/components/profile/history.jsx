import React from 'react';
import { Droplet } from 'lucide-react';

const DonationHistory = ({ history }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {history.map((donation, index) => (
          <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Droplet className="text-red-600" size={20} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-medium text-gray-900">
                    {donation.donationId.date}
                  </h3>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    {donation.donationId.units} unit{donation.donationId.units > 1 ? 's' : ''}
                  </span>
                </div>
                
                <p className="text-gray-600 mt-2 text-sm">
                  {donation.center.name}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {donation.center.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationHistory;