import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Users, 
  MapPin, 
  Bell, 
  Award, 
  Share2, 
  BookOpen, 
  Filter,
  ChevronDown,
  Copy,
  Eye,
  List,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trophy,
  Star,
  Gift,
  Droplets,
  Phone,
  ExternalLink
} from 'lucide-react';

const BloodDonorDashboard = () => {
  const [radiusFilter, setRadiusFilter] = useState('10km');
  const [viewMode, setViewMode] = useState('list');
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Mock user data
  const userData = {
    firstName: 'Sarah',
    bloodType: 'O+',
    isEligible: true,
    lastDonation: '2024-05-15',
    totalDonations: 12,
    nextEligibleDate: '2024-08-15',
    referralCode: 'SARAH2024',
    successfulReferrals: 3
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userData.referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const calculateDaysUntilEligible = () => {
    const today = new Date();
    const eligibleDate = new Date(userData.nextEligibleDate);
    const diffTime = eligibleDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const mockUrgentRequests = [
    {
      id: 1,
      hospital: 'City General Hospital',
      location: 'Downtown District',
      bloodType: 'O+',
      urgency: 'high',
      distance: '2.3km',
      unitsNeeded: 5,
      contact: '+1-555-0123'
    },
    {
      id: 2,
      hospital: 'St. Mary Medical Center',
      location: 'West Side',
      bloodType: 'A-',
      urgency: 'medium',
      distance: '5.7km',
      unitsNeeded: 3,
      contact: '+1-555-0456'
    },
    {
      id: 3,
      hospital: 'Emergency Care Unit',
      location: 'North End',
      bloodType: 'AB+',
      urgency: 'low',
      distance: '8.1km',
      unitsNeeded: 2,
      contact: '+1-555-0789'
    }
  ];

  const mockUpcomingDrives = [
    {
      id: 1,
      title: 'Community Blood Drive',
      date: '2024-07-20',
      time: '9:00 AM - 4:00 PM',
      location: 'Community Center Hall',
      organizer: 'Red Cross Society',
      registered: false
    },
    {
      id: 2,
      title: 'Corporate Donation Day',
      date: '2024-07-25',
      time: '10:00 AM - 2:00 PM',
      location: 'Tech Park Building A',
      organizer: 'Local Blood Bank',
      registered: true
    },
    {
      id: 3,
      title: 'University Health Fair',
      date: '2024-08-01',
      time: '11:00 AM - 5:00 PM',
      location: 'State University Campus',
      organizer: 'Student Health Services',
      registered: false
    }
  ];

  const mockDonationHistory = [
    {
      id: 1,
      date: '2024-05-15',
      location: 'City Blood Bank',
      status: 'completed',
      thankYouNote: 'Your donation helped save 3 lives!',
      badge: 'Emergency Hero'
    },
    {
      id: 2,
      date: '2024-02-10',
      location: 'Hospital Drive',
      status: 'completed',
      thankYouNote: 'Thank you for your generous contribution.',
      badge: null
    },
    {
      id: 3,
      date: '2023-11-05',
      location: 'Community Center',
      status: 'completed',
      thankYouNote: 'Your blood type was in high demand!',
      badge: 'Lifesaver'
    }
  ];

  const mockNotifications = [
    {
      id: 1,
      type: 'urgent',
      message: 'New urgent request for O+ blood in your area',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'reminder',
      message: 'You\'re eligible to donate again in 5 days',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      type: 'achievement',
      message: 'Congratulations! You\'ve earned the "Dozen Donor" badge',
      time: '3 days ago',
      read: true
    }
  ];

  const mockBadges = [
    { id: 1, name: 'First Timer', description: 'First donation completed', unlocked: true, icon: '🩸' },
    { id: 2, name: 'Lifesaver', description: '5 donations completed', unlocked: true, icon: '💝' },
    { id: 3, name: 'Dozen Donor', description: '12 donations completed', unlocked: true, icon: '🏆' },
    { id: 4, name: 'Emergency Hero', description: 'Responded to urgent request', unlocked: true, icon: '🚨' },
    { id: 5, name: 'Community Champion', description: '20 donations completed', unlocked: false, icon: '👑' },
    { id: 6, name: 'Platinum Donor', description: '50 donations completed', unlocked: false, icon: '💎' }
  ];

  const mockResources = [
    { id: 1, title: 'What to eat before donating', category: 'Preparation', readTime: '3 min' },
    { id: 2, title: 'Myths about blood donation', category: 'Education', readTime: '5 min' },
    { id: 3, title: 'Recovery tips after donation', category: 'Aftercare', readTime: '4 min' },
    { id: 4, title: 'Understanding blood types', category: 'Education', readTime: '6 min' }
  ];

  const SummaryCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const UrgencyBadge = ({ urgency }) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[urgency]}`}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  const StatusIcon = ({ status }) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'pending') return <Clock className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Droplets className="w-8 h-8 text-red-500 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Blood Donor Dashboard</h1>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Bell className="w-6 h-6" />
                {mockNotifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockNotifications.map(notification => (
                      <div key={notification.id} className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {userData.firstName}!</h2>
              <p className="text-lg opacity-90 mb-4">You're a lifesaver today!</p>
              <div className="flex items-center space-x-4">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  Blood Type: {userData.bloodType}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm flex items-center ${userData.isEligible ? 'bg-green-500 bg-opacity-20' : 'bg-yellow-500 bg-opacity-20'}`}>
                  {userData.isEligible ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                  {userData.isEligible ? 'Eligible to Donate' : 'Not Eligible Yet'}
                </span>
              </div>
            </div>
            <Heart className="w-24 h-24 opacity-30" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={Calendar}
            title="Last Donation"
            value={new Date(userData.lastDonation).toLocaleDateString()}
            subtitle="3 months ago"
          />
          <SummaryCard
            icon={Clock}
            title="Eligible Again In"
            value={`${calculateDaysUntilEligible()} days`}
            subtitle="Based on last donation"
            color="green"
          />
          <SummaryCard
            icon={Droplets}
            title="Total Donations"
            value={userData.totalDonations}
            subtitle="Since joining"
            color="red"
          />
          <SummaryCard
            icon={Heart}
            title="Estimated Lives Saved"
            value={userData.totalDonations * 3}
            subtitle="Each donation saves ~3 lives"
            color="pink"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Urgent Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  Urgent Requests Nearby
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={radiusFilter}
                    onChange={(e) => setRadiusFilter(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="5km">5km</option>
                    <option value="10km">10km</option>
                    <option value="20km">20km</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {mockUrgentRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{request.hospital}</h4>
                          <UrgencyBadge urgency={request.urgency} />
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {request.location} ({request.distance})
                          </span>
                          <span className="flex items-center">
                            <Droplets className="w-4 h-4 mr-1" />
                            {request.bloodType} - {request.unitsNeeded} units needed
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                          View Details
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Drives */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Donation Drives</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {mockUpcomingDrives.map(drive => (
                  <div key={drive.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{drive.title}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(drive.date).toLocaleDateString()} • {drive.time}
                          </p>
                          <p className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {drive.location}
                          </p>
                          <p className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {drive.organizer}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {drive.registered ? (
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                            Registered
                          </span>
                        ) : (
                          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                            Register
                          </button>
                        )}
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Remind Me
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
              <div className="space-y-4">
                {mockDonationHistory.map(donation => (
                  <div key={donation.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <StatusIcon status={donation.status} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{donation.location}</h4>
                        <span className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{donation.thankYouNote}</p>
                      {donation.badge && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Award className="w-3 h-3 mr-1" />
                          {donation.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Badges */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {mockBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border text-center ${badge.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <h4 className="font-medium text-xs text-gray-900">{badge.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Widget */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Refer Friends
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your referral code:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1 text-center">
                      {userData.referralCode}
                    </code>
                    <button
                      onClick={handleCopyReferral}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copiedReferral && (
                    <p className="text-green-600 text-sm mt-2">Code copied!</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Successful referrals: <span className="font-semibold">{userData.successfulReferrals}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Resource Center */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Resource Center
              </h3>
              <div className="space-y-3">
                {mockResources.map(resource => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{resource.title}</h4>
                      <p className="text-xs text-gray-600">{resource.category} • {resource.readTime}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-lg opacity-90 mb-6">Every donation can help save up to 3 lives. Check for urgent requests in your area.</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Find Urgent Requests
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Donation
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Volunteer at Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDonorDashboard;