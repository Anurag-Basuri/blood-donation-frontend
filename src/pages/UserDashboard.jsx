import { motion } from "framer-motion";
import Countdown from "react-countdown";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  BellIcon,
  HeartIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function UserDashboard() {
  const lastDonationDate = new Date("2024-02-15");
  const nextDonationDate = new Date(
    lastDonationDate.setMonth(lastDonationDate.getMonth() + 3)
  );

  const upcomingCamps = [
    { date: "2024-05-20", location: "City Blood Bank", slots: 15 },
    { date: "2024-05-22", location: "Community Center", slots: 8 },
  ];

  const urgentRequests = [
    {
      hospital: "Central Hospital",
      bloodType: "O+",
      distance: "2.5km",
      urgency: "High",
    },
    {
      hospital: "Childrens Clinic",
      bloodType: "A-",
      distance: "4.1km",
      urgency: "Medium",
    },
  ];

  // Chart data
  const chartData = {
    labels: ["Total Donations", "Remaining"],
    datasets: [
      {
        data: [8, 2],
        backgroundColor: ["#4F46E5", "#E5E7EB"],
        hoverBackgroundColor: ["#4338CA", "#D1D5DB"],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Last Donation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Last Donation</h2>
            <BellIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">{lastDonationDate.toDateString()}</p>
              <p className="text-sm text-gray-500">City Central Hospital</p>
            </div>
            <div className="text-center bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600">Next donation in</p>
              <Countdown
                date={nextDonationDate}
                renderer={({ days }) => (
                  <span className="text-2xl font-bold text-indigo-600">
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
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Camps</h2>
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="space-y-4">
            {upcomingCamps.map((camp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(camp.date).toDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{camp.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-indigo-600">
                    {camp.slots} slots left
                  </span>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Register
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
          className="p-6 bg-red-50 rounded-xl shadow-sm border border-red-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-800">
              Urgent Requests
            </h2>
            <HeartIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-4">
            {urgentRequests.map((request, index) => (
              <div key={index} className="p-3 bg-white rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-red-800">
                      {request.hospital}
                    </h3>
                    <p className="text-sm text-red-600">
                      {request.bloodType} • {request.distance}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
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
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
          <div className="flex items-center justify-between">
            <div className="w-32 h-32">
              <Doughnut data={chartData} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-gray-500">Lives Saved</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-gray-500">Total Donations</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
