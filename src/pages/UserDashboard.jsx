import { useState } from "react";
import { motion } from "framer-motion";
import Countdown from "react-countdown";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  BellIcon,
  HeartIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Color Scheme
  const colors = {
    primary: "#DC2626", // Red-600
    secondary: "#059669", // Emerald-600
    accent: "#D97706", // Amber-600
    background: "#F8FAFC", // Slate-50
    card: "#FFFFFF",
    text: "#1E293B", // Slate-800
    mutedText: "#64748B", // Slate-500
  };

  // User data
  const user = {
    name: "John Doe",
    bloodType: "O+",
    lastDonation: new Date("2024-02-15"),
    totalDonations: 8,
    livesSaved: 24,
    nextDonation: new Date(
      new Date("2024-02-15").setMonth(new Date("2024-02-15").getMonth() + 3)
    ),
  };

  // Mock data
  const upcomingCamps = [
    {
      id: 1,
      date: "2024-05-20",
      location: "City Blood Bank",
      address: "123 Main St, Cityville",
      coords: { lat: 37.7749, lng: -122.4194 },
      slots: 15,
      facilities: ["Health Checkup", "Refreshments"],
      registered: true,
    },
    {
      id: 2,
      date: "2024-05-22",
      location: "Community Center",
      address: "456 Oak Ave, Townsville",
      coords: { lat: 37.7819, lng: -122.4317 },
      slots: 8,
      facilities: ["Certificate", "Gift"],
      registered: false,
    },
  ];

  const urgentRequests = [
    {
      id: 1,
      hospital: "Central Hospital",
      bloodType: "O+",
      distance: "2.5km",
      urgency: "High",
      coords: { lat: 37.7769, lng: -122.4164 },
    },
    {
      id: 2,
      hospital: "Children's Clinic",
      bloodType: "A-",
      distance: "4.1km",
      urgency: "Medium",
      coords: { lat: 37.7729, lng: -122.4234 },
    },
  ];

  const donationHistory = [
    { id: 1, date: "2024-02-15", location: "City Central Hospital", units: 1 },
    { id: 2, date: "2023-11-10", location: "Red Cross Center", units: 1 },
    { id: 3, date: "2023-08-05", location: "Community Blood Drive", units: 1 },
  ];

  const badges = [
    { name: "Bronze Donor", earned: true, description: "3+ donations" },
    { name: "Silver Donor", earned: true, description: "5+ donations" },
    { name: "Gold Donor", earned: false, description: "8+ donations" },
  ];

  // Chart data
  const chartData = {
    labels: ["Total Donations", "Remaining"],
    datasets: [
      {
        data: [8, 2],
        backgroundColor: [colors.primary, "#FEE2E2"],
        hoverBackgroundColor: ["#B91C1C", "#FECACA"],
      },
    ],
  };

  const NavigationItem = ({ icon, label, notifications = 0 }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center p-3 rounded-lg cursor-pointer ${
        activeView === label.toLowerCase().replace(" ", "-")
          ? "bg-red-100"
          : "hover:bg-red-50"
      }`}
      onClick={() => setActiveView(label.toLowerCase().replace(" ", "-"))}
    >
      {icon}
      <span className="ml-3 font-medium" style={{ color: colors.text }}>
        {label}
      </span>
      {notifications > 0 && (
        <span className="ml-auto bg-red-600 text-white rounded-full px-2 py-1 text-xs">
          {notifications}
        </span>
      )}
    </motion.div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Last Donation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: colors.card }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.text }}
            >
              Last Donation
            </h2>
            <BellIcon className="h-6 w-6" style={{ color: colors.primary }} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: colors.text }}>
                {user.lastDonation.toDateString()}
              </p>
              <p className="text-sm" style={{ color: colors.mutedText }}>
                City Central Hospital
              </p>
            </div>
            <div
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: "#FEE2E2" }}
            >
              <p className="text-sm" style={{ color: colors.primary }}>
                Next donation in
              </p>
              <Countdown
                date={user.nextDonation}
                renderer={({ days }) => (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {days} days
                  </span>
                )}
              />
            </div>
          </div>
        </motion.div>

        {/* Upcoming Camps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: colors.card }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.text }}
            >
              Upcoming Camps
            </h2>
            <CalendarIcon
              className="h-6 w-6"
              style={{ color: colors.primary }}
            />
          </div>
          <div className="space-y-4">
            {upcomingCamps.map((camp) => (
              <div
                key={camp.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "#FEE2E2" }}
              >
                <div>
                  <p className="font-medium" style={{ color: colors.text }}>
                    {new Date(camp.date).toDateString()}
                  </p>
                  <p className="text-sm" style={{ color: colors.mutedText }}>
                    {camp.location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: colors.primary }}>
                    {camp.slots} slots left
                  </span>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      camp.registered
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {camp.registered ? "Registered" : "Register"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Urgent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: colors.card }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.text }}
            >
              Urgent Requests
            </h2>
            <HeartIcon className="h-6 w-6" style={{ color: colors.primary }} />
          </div>
          <div className="space-y-4">
            {urgentRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 rounded-lg"
                style={{ backgroundColor: "#FEE2E2" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium" style={{ color: colors.text }}>
                      {request.hospital}
                    </h3>
                    <p className="text-sm" style={{ color: colors.primary }}>
                      {request.bloodType} • {request.distance}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      request.urgency === "High"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {request.urgency}
                  </span>
                </div>
                <button className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Donate Now
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: colors.card }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: colors.text }}
          >
            Your Impact
          </h2>
          <div className="flex items-center justify-between">
            <div className="w-32 h-32">
              <Doughnut data={chartData} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserGroupIcon
                  className="h-8 w-8"
                  style={{ color: colors.primary }}
                />
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {user.livesSaved}
                  </p>
                  <p className="text-sm" style={{ color: colors.mutedText }}>
                    Lives Saved
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon
                  className="h-8 w-8"
                  style={{ color: colors.primary }}
                />
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {user.totalDonations}
                  </p>
                  <p className="text-sm" style={{ color: colors.mutedText }}>
                    Total Donations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderCamps = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
        Find Blood Donation Camps
      </h2>

      {/* Map View */}
      {isLoaded && (
        <div
          className="h-96 rounded-xl shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.card }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={12}
            center={{ lat: 37.7749, lng: -122.4194 }}
          >
            {upcomingCamps.map((camp) => (
              <Marker
                key={camp.id}
                position={camp.coords}
                icon={{
                  url: `https://maps.google.com/mapfiles/ms/icons/${
                    camp.registered ? "green" : "red"
                  }-dot.png`,
                }}
              />
            ))}
          </GoogleMap>
        </div>
      )}

      {/* Camps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingCamps.map((camp) => (
          <div
            key={camp.id}
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                {camp.location}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  camp.registered
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {camp.registered ? "Registered" : "Available"}
              </span>
            </div>

            <p className="mb-3" style={{ color: colors.text }}>
              <CalendarIcon
                className="inline h-5 w-5 mr-2"
                style={{ color: colors.primary }}
              />
              {new Date(camp.date).toDateString()}
            </p>

            <p className="mb-4" style={{ color: colors.text }}>
              <MapPinIcon
                className="inline h-5 w-5 mr-2"
                style={{ color: colors.primary }}
              />
              {camp.address}
            </p>

            <div className="mb-4">
              <h4
                className="text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Facilities:
              </h4>
              <div className="flex flex-wrap gap-2">
                {camp.facilities.map((facility, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: "#FEE2E2", color: colors.text }}
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            <button
              className={`w-full py-2 rounded-lg flex items-center justify-center ${
                camp.registered
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {camp.registered ? "View Details" : "Register Now"}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
        Donation History
      </h2>

      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{ backgroundColor: colors.card }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#FEE2E2" }}>
              <th
                className="px-6 py-3 text-left text-xs font-medium"
                style={{ color: colors.text }}
              >
                Date
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium"
                style={{ color: colors.text }}
              >
                Location
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium"
                style={{ color: colors.text }}
              >
                Units
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium"
                style={{ color: colors.text }}
              >
                Certificate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donationHistory.map((donation) => (
              <tr key={donation.id} className="hover:bg-red-50">
                <td className="px-6 py-4" style={{ color: colors.text }}>
                  {new Date(donation.date).toDateString()}
                </td>
                <td className="px-6 py-4" style={{ color: colors.text }}>
                  {donation.location}
                </td>
                <td className="px-6 py-4" style={{ color: colors.text }}>
                  {donation.units}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-red-600 hover:text-red-800"
                    style={{ color: colors.primary }}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
        Badges & Rewards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className="p-6 rounded-xl shadow-sm border"
            style={{
              backgroundColor: colors.card,
              borderColor: badge.earned ? colors.primary : "#E5E7EB",
            }}
          >
            <div className="flex items-center mb-4">
              <TrophyIcon
                className={`h-10 w-10 mr-4 ${
                  badge.earned ? "text-yellow-500" : "text-gray-300"
                }`}
              />
              <div>
                <h3 className="font-bold" style={{ color: colors.text }}>
                  {badge.name}
                </h3>
                <p className="text-sm" style={{ color: colors.mutedText }}>
                  {badge.description}
                </p>
              </div>
            </div>
            {badge.earned ? (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Earned
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
        Certificates & Health Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {donationHistory.map((donation) => (
          <div
            key={donation.id}
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold" style={{ color: colors.text }}>
                  Donation Certificate
                </h3>
                <p style={{ color: colors.mutedText }}>
                  {new Date(donation.date).toDateString()} • {donation.location}
                </p>
              </div>
              <DocumentTextIcon
                className="h-8 w-8"
                style={{ color: colors.primary }}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Download PDF
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-50"
                style={{ color: colors.text }}
              >
                View Health Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.div
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } transition-all duration-300 shadow-sm`}
          style={{ backgroundColor: colors.card }}
        >
          <div className="p-4">
            <div className="flex items-center mb-8">
              <HeartIcon
                className="h-8 w-8"
                style={{ color: colors.primary }}
              />
              {sidebarOpen && (
                <h1
                  className="text-xl font-bold ml-2"
                  style={{ color: colors.text }}
                >
                  BloodHero
                </h1>
              )}
            </div>

            <nav className="space-y-2">
              <NavigationItem
                icon={<HomeIcon className="h-5 w-5" />}
                label="Dashboard"
              />
              <NavigationItem
                icon={<MapPinIcon className="h-5 w-5" />}
                label="Find Camps"
                notifications={
                  upcomingCamps.filter((c) => !c.registered).length
                }
              />
              <NavigationItem
                icon={<HeartIcon className="h-5 w-5" />}
                label="Urgent Requests"
                notifications={
                  urgentRequests.filter((r) => r.urgency === "High").length
                }
              />
              <NavigationItem
                icon={<DocumentTextIcon className="h-5 w-5" />}
                label="Donation History"
              />
              <NavigationItem
                icon={<TrophyIcon className="h-5 w-5" />}
                label="Badges & Rewards"
              />
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-red-50 rounded-lg"
            >
              <ChevronDownIcon
                className={`h-5 w-5 transform ${
                  sidebarOpen ? "rotate-90" : "-rotate-90"
                } transition-transform`}
                style={{ color: colors.text }}
              />
            </button>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <UserIcon
                  className="h-5 w-5"
                  style={{ color: colors.primary }}
                />
              </div>
              {sidebarOpen && (
                <span className="font-medium" style={{ color: colors.text }}>
                  John Doe
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          {activeView === "dashboard" && renderDashboard()}
          {activeView === "find-camps" && renderCamps()}
          {activeView === "donation-history" && renderHistory()}
          {activeView === "badges-&-rewards" && renderBadges()}
          {activeView === "certificates" && renderCertificates()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
