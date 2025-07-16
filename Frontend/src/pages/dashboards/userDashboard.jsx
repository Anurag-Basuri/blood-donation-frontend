import React, { useState } from 'react';
import {
  Heart,
  AlertCircle,
  CalendarDays,
  Gift,
  Users,
  Star,
  ClipboardCheck,
  Share2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip'; // Or use your preferred tooltip lib

// Theme system example
const theme = {
  urgent: {
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: <AlertCircle className="text-red-500" aria-label="Urgent" />,
  },
  normal: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    icon: <AlertCircle className="text-yellow-400" aria-label="Normal" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
    icon: <Info className="text-blue-400" aria-label="Info" />,
  },
};

// Reusable grid component
const GridSection = ({
  items,
  direction = 'row',
  gap = 'gap-4',
  renderItem,
  ariaLabel,
  ...props
}) => (
  <div
    className={`grid ${direction === 'row' ? 'grid-cols-2 md:grid-cols-4' : 'grid-rows-2'} ${gap}`}
    role="list"
    aria-label={ariaLabel}
    {...props}
  >
    {items.map((item, idx) => (
      <motion.div
        key={item.id || idx}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        role="listitem"
        tabIndex={0}
        aria-label={item.ariaLabel}
        className="focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        {renderItem(item)}
      </motion.div>
    ))}
  </div>
);

// Accordion for mobile
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg mb-2 bg-white/70">
      <button
        className="w-full flex justify-between items-center px-4 py-3 font-semibold text-lg focus:outline-none"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`panel-${title}`}
      >
        {title}
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`panel-${title}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Confetti animation (simple)
const Confetti = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.7 }}
        className="fixed inset-0 pointer-events-none z-50 flex justify-center items-center"
      >
        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-6 rounded bg-pink-400 absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                rotate: `${Math.random() * 360}deg`,
              }}
              initial={{ y: -30 }}
              animate={{ y: 60 + Math.random() * 80 }}
              transition={{ duration: 1.2, delay: i * 0.05 }}
            />
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const DonorDashboard = () => {
  // Mock data
  const eligibility = { eligible: true, nextDate: '2025-08-10' };
  const urgentRequests = [
    { id: 1, hospital: 'City Hospital', blood: 'O-', urgency: 'urgent', time: '2h left' },
    { id: 2, hospital: 'Metro Clinic', blood: 'A+', urgency: 'normal', time: '6h left' },
  ];
  const donationHistory = [
    { id: 1, date: '2025-06-12', location: 'City Hospital', status: 'Completed' },
    { id: 2, date: '2025-03-05', location: 'Metro Clinic', status: 'Completed' },
  ];
  const badges = [
    { id: 1, label: 'First Donation', icon: <Heart />, achieved: true },
    { id: 2, label: '5 Donations', icon: <Star />, achieved: false },
    { id: 3, label: 'Referral Hero', icon: <Gift />, achieved: true },
  ];
  const upcomingDrives = [
    { id: 1, date: '2025-07-25', location: 'Community Center' },
    { id: 2, date: '2025-08-05', location: 'Town Hall' },
  ];

  // Referral animation
  const [showConfetti, setShowConfetti] = useState(false);
  const referralCode = 'LIFELINK-2025';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  };

  // Responsive: collapse panels on mobile
  const isMobile = window.innerWidth < 768;

  return (
    <main className="bg-gradient-to-br from-red-50 via-white to-pink-50 min-h-screen px-2 sm:px-6 py-6">
      <Confetti show={showConfetti} />

      {/* Eligibility & Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" aria-label="Eligibility" />
            <span className="text-xl font-bold">
              {eligibility.eligible ? 'Eligible to Donate' : 'Not Eligible'}
            </span>
            <Tooltip anchorSelect=".eligibility-tooltip" place="top">
              Next eligible: {eligibility.nextDate}
            </Tooltip>
            <span className="eligibility-tooltip ml-2 text-sm text-gray-500">
              Next: {eligibility.nextDate}
            </span>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold shadow"
              aria-label="Donate Now"
              tabIndex={0}
            >
              Donate Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-full border border-red-600 text-red-600 font-bold bg-white"
              aria-label="Refer a Friend"
              tabIndex={0}
            >
              Refer a Friend
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Urgent Requests */}
      {isMobile ? (
        <Accordion title="Urgent Requests" defaultOpen>
          <GridSection
            items={urgentRequests}
            direction="row"
            gap="gap-3"
            ariaLabel="Urgent Requests"
            renderItem={req => (
              <div
                className={`p-4 rounded-lg border shadow-sm ${theme[req.urgency].bg} ${
                  theme[req.urgency].border
                }`}
                tabIndex={0}
                aria-label={`Urgent request for ${req.blood} at ${req.hospital}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {theme[req.urgency].icon}
                  <span className={`font-bold ${theme[req.urgency].text}`}>{req.blood}</span>
                  <Tooltip anchorSelect=".urgent-tooltip" place="top">
                    Urgency: {req.urgency}
                  </Tooltip>
                  <span className="urgent-tooltip ml-2 text-xs">{req.time}</span>
                </div>
                <div className="text-sm">{req.hospital}</div>
              </div>
            )}
          />
        </Accordion>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="text-red-500" aria-label="Urgent Requests" />
            Urgent Requests
          </h2>
          <GridSection
            items={urgentRequests}
            direction="row"
            gap="gap-4"
            ariaLabel="Urgent Requests"
            renderItem={req => (
              <div
                className={`p-4 rounded-lg border shadow-sm ${theme[req.urgency].bg} ${
                  theme[req.urgency].border
                }`}
                tabIndex={0}
                aria-label={`Urgent request for ${req.blood} at ${req.hospital}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {theme[req.urgency].icon}
                  <span className={`font-bold ${theme[req.urgency].text}`}>{req.blood}</span>
                  <Tooltip anchorSelect=".urgent-tooltip" place="top">
                    Urgency: {req.urgency}
                  </Tooltip>
                  <span className="urgent-tooltip ml-2 text-xs">{req.time}</span>
                </div>
                <div className="text-sm">{req.hospital}</div>
              </div>
            )}
          />
        </motion.section>
      )}

      {/* Donation History */}
      {isMobile ? (
        <Accordion title="Donation History">
          <GridSection
            items={donationHistory}
            direction="col"
            gap="gap-2"
            ariaLabel="Donation History"
            renderItem={don => (
              <div
                className="p-3 rounded-lg border bg-white shadow-sm flex flex-col"
                tabIndex={0}
                aria-label={`Donation at ${don.location} on ${don.date}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="text-green-500" aria-label="Completed" />
                  <span className="font-bold">{don.status}</span>
                  <Tooltip anchorSelect=".donation-tooltip" place="top">
                    Status: {don.status}
                  </Tooltip>
                </div>
                <div className="text-xs text-gray-600">
                  {don.date} • {don.location}
                </div>
              </div>
            )}
          />
        </Accordion>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <CalendarDays className="text-pink-500" aria-label="Donation History" />
            Donation History
          </h2>
          <GridSection
            items={donationHistory}
            direction="row"
            gap="gap-4"
            ariaLabel="Donation History"
            renderItem={don => (
              <div
                className="p-4 rounded-lg border bg-white shadow-sm flex flex-col"
                tabIndex={0}
                aria-label={`Donation at ${don.location} on ${don.date}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="text-green-500" aria-label="Completed" />
                  <span className="font-bold">{don.status}</span>
                  <Tooltip anchorSelect=".donation-tooltip" place="top">
                    Status: {don.status}
                  </Tooltip>
                </div>
                <div className="text-xs text-gray-600">
                  {don.date} • {don.location}
                </div>
              </div>
            )}
          />
        </motion.section>
      )}

      {/* Achievements / Badges */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Star className="text-yellow-400" aria-label="Achievements" />
          Achievements
        </h2>
        <GridSection
          items={badges}
          direction="row"
          gap="gap-4"
          ariaLabel="Achievements"
          renderItem={badge => (
            <div
              className={`p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center ${
                badge.achieved
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-gray-50 border-gray-300 opacity-60'
              }`}
              tabIndex={0}
              aria-label={badge.label}
            >
              <span className="mb-2" aria-label={badge.label}>
                {badge.icon}
              </span>
              <span className="font-semibold text-sm">{badge.label}</span>
              {badge.achieved && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-2 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"
                >
                  Achieved
                </motion.div>
              )}
            </div>
          )}
        />
      </motion.section>

      {/* Referral */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mb-8"
        aria-labelledby="referral-heading"
      >
        <h2 id="referral-heading" className="text-xl font-bold mb-3 flex items-center gap-2">
          <Share2 className="text-blue-500" aria-label="Referral" />
          Referral
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div
            className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border shadow"
            role="group"
            aria-label="Referral Code Section"
          >
            <span className="font-mono text-lg" aria-label="Referral Code">
              {referralCode}
            </span>
            <motion.button
              whileHover={{
                scale: 1.1,
                rotate: 10,
                boxShadow: '0 2px 12px 0 #f43f5e44',
                transition: { type: 'spring', stiffness: 300 },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyReferral}
              className="ml-2 px-2 py-1 rounded bg-pink-100 text-pink-700 font-bold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Copy Referral Code"
              tabIndex={0}
              data-tooltip-id="copy-referral-tooltip"
            >
              <Gift className="w-4 h-4" aria-label="Copy" />
              Copy
            </motion.button>
            <Tooltip id="copy-referral-tooltip" place="top" content="Copy referral code" />
            <span className="referral-tooltip ml-2 text-xs text-gray-400" aria-live="polite">
              Share & earn badges!
            </span>
          </div>
        </div>
        {/* Confetti animation for referral copy */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.7 }}
              className="fixed inset-0 pointer-events-none z-50 flex justify-center items-center"
              aria-hidden="true"
            >
              <div className="confetti">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-6 rounded bg-pink-400 absolute"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                      rotate: `${Math.random() * 360}deg`,
                    }}
                    initial={{ y: -30 }}
                    animate={{ y: 60 + Math.random() * 80 }}
                    transition={{ duration: 1.2, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Upcoming Drives */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <CalendarDays className="text-indigo-500" aria-label="Upcoming Drives" />
          Upcoming Drives
        </h2>
        <GridSection
          items={upcomingDrives}
          direction="row"
          gap="gap-4"
          ariaLabel="Upcoming Drives"
          renderItem={drive => (
            <div
              className="p-4 rounded-lg border bg-white shadow-sm flex flex-col items-center"
              tabIndex={0}
              aria-label={`Drive at ${drive.location} on ${drive.date}`}
            >
              <CalendarDays className="text-indigo-500 mb-2" aria-label="Drive Date" />
              <span className="font-bold">{drive.date}</span>
              <span className="text-sm text-gray-600">{drive.location}</span>
            </div>
          )}
        />
      </motion.section>
    </main>
  );
};

export default DonorDashboard;