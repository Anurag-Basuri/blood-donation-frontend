import React, { useState } from 'react';
import {
  Heart,
  Users,
  AlertCircle,
  CalendarDays,
  Edit,
  X,
  CheckCircle,
  BadgeCheck,
  Bell,
  Info,
  Droplet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

// Mock data
const mockInventory = [
  { group: 'A+', units: 12 },
  { group: 'A-', units: 3 },
  { group: 'B+', units: 8 },
  { group: 'B-', units: 2 },
  { group: 'O+', units: 15 },
  { group: 'O-', units: 1 },
  { group: 'AB+', units: 5 },
  { group: 'AB-', units: 0 },
];

const mockAppointments = [
  { id: 1, donor: 'John Doe', group: 'O+', time: '2025-07-18 10:00', status: 'Scheduled' },
  { id: 2, donor: 'Priya Singh', group: 'A-', time: '2025-07-18 11:30', status: 'Confirmed' },
  { id: 3, donor: 'Carlos Mendez', group: 'B+', time: '2025-07-18 13:00', status: 'Scheduled' },
];

const mockRequests = [
  { id: 1, group: 'O-', units: 4, status: 'Active', urgency: 'High', created: '2h ago' },
  { id: 2, group: 'A-', units: 2, status: 'Active', urgency: 'Medium', created: '1d ago' },
];

const hospitalProfile = {
  name: 'City Hospital',
  verified: true,
  contact: 'info@cityhospital.com',
  phone: '+1 555-1234',
  address: '123 Main St, Metropolis',
};

const getLowStockGroups = (inventory, threshold = 3) =>
  inventory.filter(item => item.units <= threshold);

const DashboardCard = ({ icon, label, value, color, tooltip }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`flex items-center gap-4 p-4 rounded-xl shadow bg-white border-l-4 ${color} relative`}
    tabIndex={0}
    aria-label={label}
  >
    <span className="text-2xl">{icon}</span>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
    {tooltip && (
      <Tooltip anchorSelect=".dashboard-card-tooltip" place="top">
        {tooltip}
      </Tooltip>
    )}
  </motion.div>
);

const HospitalDashboard = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', message: 'Low stock: O-, AB-', icon: <AlertCircle className="text-red-500" /> },
    { id: 2, type: 'info', message: '3 new donor appointments today', icon: <Bell className="text-blue-500" /> },
  ]);
  const [requests, setRequests] = useState(mockRequests);

  // Edit/cancel handlers (mock)
  const handleEditRequest = id => {
    // Implement edit logic/modal
    alert(`Edit request ${id}`);
  };
  const handleCancelRequest = id => {
    setRequests(requests.filter(r => r.id !== id));
  };

  // Stats
  const totalStock = mockInventory.reduce((sum, item) => sum + item.units, 0);
  const pendingConfirmations = mockAppointments.filter(a => a.status === 'Scheduled').length;
  const totalRequests = requests.length;

  // Low stock alerts
  const lowStockGroups = getLowStockGroups(mockInventory);

  return (
    <main className="bg-gradient-to-br from-red-50 via-white to-pink-50 min-h-screen px-2 sm:px-6 py-6">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map(note => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center gap-2 px-4 py-2 rounded shadow mb-2 ${
              note.type === 'alert' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
            }`}
            role="alert"
            aria-live="polite"
          >
            {note.icon}
            <span>{note.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dashboard Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DashboardCard
          icon={<Droplet className="text-red-500" aria-label="Total Stock" />}
          label="Total Blood Stock"
          value={totalStock}
          color="border-red-500"
        />
        <DashboardCard
          icon={<Users className="text-yellow-500" aria-label="Pending Confirmations" />}
          label="Pending Confirmations"
          value={pendingConfirmations}
          color="border-yellow-400"
        />
        <DashboardCard
          icon={<Heart className="text-pink-500" aria-label="Requests Raised" />}
          label="Active Requests"
          value={totalRequests}
          color="border-pink-400"
        />
      </section>

      {/* Blood Inventory Table */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8"
        aria-labelledby="inventory-heading"
      >
        <h2 id="inventory-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <Droplet className="text-red-500" aria-label="Blood Inventory" />
          Blood Inventory
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow border">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Blood Group</th>
                <th className="py-2 px-4 text-left">Units Available</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInventory.map(item => (
                <tr key={item.group} className={item.units <= 3 ? 'bg-red-50' : ''}>
                  <td className="py-2 px-4 font-bold">{item.group}</td>
                  <td className="py-2 px-4">{item.units}</td>
                  <td className="py-2 px-4">
                    {item.units === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4" aria-label="Out of Stock" />
                        Out of Stock
                      </span>
                    ) : item.units <= 3 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                        <Info className="w-4 h-4" aria-label="Low Stock" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" aria-label="Sufficient" />
                        Sufficient
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Incoming Donor Appointments */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mb-8"
        aria-labelledby="appointments-heading"
      >
        <h2 id="appointments-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="text-indigo-500" aria-label="Appointments" />
          Incoming Donor Appointments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAppointments.map(app => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: app.id * 0.1 }}
              className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2"
              tabIndex={0}
              aria-label={`Appointment with ${app.donor} (${app.group})`}
            >
              <div className="flex items-center gap-2">
                <Users className="text-pink-500" aria-label="Donor" />
                <span className="font-bold">{app.donor}</span>
                <span className="ml-2 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">
                  {app.group}
                </span>
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-400" aria-label="Time" />
                {app.time}
              </div>
              <div className="text-xs">
                Status:{' '}
                <span
                  className={`font-semibold ${
                    app.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Active Urgent Requests */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mb-8"
        aria-labelledby="requests-heading"
      >
        <h2 id="requests-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="text-red-500" aria-label="Active Requests" />
          Active Urgent Requests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(req => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: req.id * 0.1 }}
              className={`rounded-lg border shadow bg-white p-4 flex flex-col gap-2 ${
                req.urgency === 'High'
                  ? 'border-red-500'
                  : req.urgency === 'Medium'
                  ? 'border-yellow-400'
                  : 'border-gray-300'
              }`}
              tabIndex={0}
              aria-label={`Request for ${req.group}, ${req.units} units`}
            >
              <div className="flex items-center gap-2">
                <Droplet className="text-red-500" aria-label="Blood Group" />
                <span className="font-bold">{req.group}</span>
                <span className="ml-2 px-2 py-1 rounded bg-pink-100 text-pink-700 text-xs font-semibold">
                  {req.units} units
                </span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                    req.urgency === 'High'
                      ? 'bg-red-100 text-red-700'
                      : req.urgency === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {req.urgency} Urgency
                </span>
              </div>
              <div className="text-xs text-gray-500">Raised: {req.created}</div>
              <div className="flex gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditRequest(req.id)}
                  className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Edit Request"
                  tabIndex={0}
                  data-tooltip-id={`edit-request-${req.id}`}
                >
                  <Edit className="w-4 h-4" aria-label="Edit" />
                  Edit
                  <Tooltip id={`edit-request-${req.id}`} place="top" content="Edit request" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCancelRequest(req.id)}
                  className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Cancel Request"
                  tabIndex={0}
                  data-tooltip-id={`cancel-request-${req.id}`}
                >
                  <X className="w-4 h-4" aria-label="Cancel" />
                  Cancel
                  <Tooltip id={`cancel-request-${req.id}`} place="top" content="Cancel request" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Hospital Profile */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mb-8"
        aria-labelledby="profile-heading"
      >
        <h2 id="profile-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="text-blue-500" aria-label="Hospital Profile" />
          Hospital Profile
          {hospitalProfile.verified && (
            <span className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
              <BadgeCheck className="w-4 h-4" aria-label="Verified" />
              Verified
            </span>
          )}
        </h2>
        <div className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2">
          <div className="font-bold text-lg">{hospitalProfile.name}</div>
          <div className="text-sm text-gray-600">{hospitalProfile.address}</div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" aria-label="Contact" />
            {hospitalProfile.contact}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" aria-label="Phone" />
            {hospitalProfile.phone}
          </div>
        </div>
      </motion.section>
    </main>
  );
};

export default HospitalDashboard;