import React, { useState } from 'react';
import {
  HeartHandshake,
  Users,
  CalendarDays,
  BarChart2,
  Edit,
  Share2,
  Download,
  Bell,
  Award,
  Star,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

// --- MOCK DATA ---
const statCards = [
  {
    label: 'Total Drives Hosted',
    value: 42,
    icon: <CalendarDays className="text-red-500" aria-label="Total Drives" />,
    color: 'border-red-500',
  },
  {
    label: 'Units Collected',
    value: 1280,
    icon: <HeartHandshake className="text-pink-500" aria-label="Units Collected" />,
    color: 'border-pink-500',
  },
  {
    label: 'Active Volunteers',
    value: 67,
    icon: <Users className="text-indigo-500" aria-label="Active Volunteers" />,
    color: 'border-indigo-500',
  },
  {
    label: 'Donors Reached',
    value: 950,
    icon: <Award className="text-yellow-500" aria-label="Donors Reached" />,
    color: 'border-yellow-500',
  },
];

const upcomingDrives = [
  {
    id: 1,
    title: 'Summer Blood Drive',
    date: '2025-07-22',
    location: 'Community Hall',
    status: 'Upcoming',
    volunteers: 12,
    unitsGoal: 100,
  },
  {
    id: 2,
    title: 'Metro Mall Drive',
    date: '2025-08-05',
    location: 'Metro Mall',
    status: 'Upcoming',
    volunteers: 8,
    unitsGoal: 80,
  },
];

const driveAnalytics = [
  { name: 'Jan', units: 120 },
  { name: 'Feb', units: 95 },
  { name: 'Mar', units: 140 },
  { name: 'Apr', units: 110 },
  { name: 'May', units: 180 },
  { name: 'Jun', units: 160 },
];

const volunteers = [
  { id: 1, name: 'Aisha Patel', role: 'Coordinator', drives: 15 },
  { id: 2, name: 'Mark Lee', role: 'Volunteer', drives: 8 },
  { id: 3, name: 'Sara Gomez', role: 'Lead', drives: 20 },
];

const topDonors = [
  { id: 1, name: 'Priya Singh', donations: 12 },
  { id: 2, name: 'John Doe', donations: 10 },
  { id: 3, name: 'Carlos Mendez', donations: 9 },
];

const resources = [
  { id: 1, name: 'Drive Poster Template', type: 'PDF', url: '#' },
  { id: 2, name: 'Volunteer Signup Sheet', type: 'Excel', url: '#' },
  { id: 3, name: 'Social Media Kit', type: 'ZIP', url: '#' },
];

// --- COMPONENTS ---
const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`flex items-center gap-4 p-4 rounded-xl shadow bg-white border-l-4 ${color} min-w-[180px]`}
    tabIndex={0}
    aria-label={label}
  >
    <span className="text-2xl">{icon}</span>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  </motion.div>
);

const NgoDashboard = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      message: 'Next drive: Summer Blood Drive on July 22',
      icon: <Bell className="text-blue-500" />,
    },
    {
      id: 2,
      type: 'alert',
      message: 'Metro Mall Drive needs more volunteers!',
      icon: <Bell className="text-red-500" />,
    },
  ]);

  // --- HANDLERS ---
  const handleEditDrive = id => {
    alert(`Edit drive ${id}`);
  };
  const handlePromoteDrive = id => {
    alert(`Promote drive ${id}`);
  };
  const handleDownloadResource = url => {
    alert(`Download resource from ${url}`);
  };

  // --- RENDER ---
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

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      {/* Upcoming Drives */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8"
        aria-labelledby="drives-heading"
      >
        <h2 id="drives-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="text-red-500" aria-label="Upcoming Drives" />
          Upcoming Blood Drives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingDrives.map(drive => (
            <motion.div
              key={drive.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: drive.id * 0.1 }}
              className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2"
              tabIndex={0}
              aria-label={`Drive: ${drive.title}`}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="text-red-500" aria-label="Drive Date" />
                <span className="font-bold">{drive.title}</span>
                <span className="ml-2 px-2 py-1 rounded bg-pink-100 text-pink-700 text-xs font-semibold">
                  {drive.date}
                </span>
              </div>
              <div className="text-sm text-gray-600">{drive.location}</div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold">
                  {drive.volunteers} Volunteers
                </span>
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">
                  Goal: {drive.unitsGoal} units
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditDrive(drive.id)}
                  className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Edit Drive"
                  tabIndex={0}
                  data-tooltip-id={`edit-drive-${drive.id}`}
                >
                  <Edit className="w-4 h-4" aria-label="Edit" />
                  Edit
                  <Tooltip id={`edit-drive-${drive.id}`} place="top" content="Edit drive" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePromoteDrive(drive.id)}
                  className="px-3 py-1 rounded bg-pink-100 text-pink-700 font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  aria-label="Promote Drive"
                  tabIndex={0}
                  data-tooltip-id={`promote-drive-${drive.id}`}
                >
                  <Share2 className="w-4 h-4" aria-label="Promote" />
                  Promote
                  <Tooltip id={`promote-drive-${drive.id}`} place="top" content="Promote drive" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Drive Analytics */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mb-8"
        aria-labelledby="analytics-heading"
      >
        <h2 id="analytics-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart2 className="text-indigo-500" aria-label="Analytics" />
          Drive Performance Analytics
        </h2>
        <div className="bg-white rounded-lg shadow border p-4">
          {/* Simple bar chart mockup */}
          <div className="flex items-end gap-4 h-32">
            {driveAnalytics.map((month, idx) => (
              <motion.div
                key={month.name}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
                className="flex flex-col items-center justify-end"
                style={{ height: '100%' }}
              >
                <div
                  className="w-8 rounded bg-pink-400"
                  style={{ height: `${month.units / 2}px` }}
                  aria-label={`Units in ${month.name}: ${month.units}`}
                ></div>
                <span className="text-xs mt-2">{month.name}</span>
                <span className="text-xs text-gray-500">{month.units}u</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Volunteer Management */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mb-8"
        aria-labelledby="volunteers-heading"
      >
        <h2 id="volunteers-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="text-indigo-500" aria-label="Volunteers" />
          Volunteer Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {volunteers.map(vol => (
            <motion.div
              key={vol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: vol.id * 0.1 }}
              className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2"
              tabIndex={0}
              aria-label={`Volunteer: ${vol.name}`}
            >
              <div className="flex items-center gap-2">
                <Users className="text-indigo-500" aria-label="Volunteer" />
                <span className="font-bold">{vol.name}</span>
              </div>
              <div className="text-sm text-gray-600">{vol.role}</div>
              <div className="text-xs text-gray-500">
                Drives: <span className="font-semibold">{vol.drives}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Top Donor Leaderboard */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mb-8"
        aria-labelledby="leaderboard-heading"
      >
        <h2 id="leaderboard-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" aria-label="Leaderboard" />
          Top Donor Leaderboard
        </h2>
        <div className="bg-white rounded-lg shadow border p-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Donor</th>
                <th className="py-2 px-4 text-left">Donations</th>
              </tr>
            </thead>
            <tbody>
              {topDonors.map((donor, idx) => (
                <tr key={donor.id} className={idx === 0 ? 'bg-yellow-50' : ''}>
                  <td className="py-2 px-4 font-bold flex items-center gap-2">
                    <Award className="text-yellow-500 w-4 h-4" aria-label="Donor" />
                    {donor.name}
                  </td>
                  <td className="py-2 px-4">{donor.donations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Resources/Templates */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mb-8"
        aria-labelledby="resources-heading"
      >
        <h2 id="resources-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="text-blue-500" aria-label="Resources" />
          Resources & Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map(res => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: res.id * 0.1 }}
              className="bg-white rounded-lg shadow border p-4 flex flex-col gap-2"
              tabIndex={0}
              aria-label={`Resource: ${res.name}`}
            >
              <div className="flex items-center gap-2">
                <Download className="text-blue-500" aria-label="Download" />
                <span className="font-bold">{res.name}</span>
              </div>
              <div className="text-xs text-gray-500">{res.type}</div>
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownloadResource(res.url)}
                className="mt-2 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Download Resource"
                tabIndex={0}
                data-tooltip-id={`download-resource-${res.id}`}
              >
                <Download className="w-4 h-4" aria-label="Download" />
                Download
                <Tooltip id={`download-resource-${res.id}`} place="top" content="Download resource" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Buttons */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mb-8 flex flex-wrap gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-label="Host New Drive"
        >
          Host New Drive
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-full bg-white border border-pink-600 text-pink-700 font-bold shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-label="Invite Volunteers"
        >
          Invite Volunteers