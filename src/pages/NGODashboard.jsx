import { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiDroplet,
  FiCalendar,
  FiAlertCircle,
  FiUsers,
  FiActivity,
  FiSettings,
  FiMapPin,
} from "react-icons/fi";
import { BarChart, PieChart } from "recharts";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 37.7749,
  lng: -122.4194,
};

const NGODashboard = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [camps] = useState([
    {
      id: 1,
      name: "Central Blood Drive",
      location: { lat: 37.7749, lng: -122.4194 },
      type: "urgent",
      date: "2024-03-15",
      donorsRegistered: 45,
    },
    {
      id: 2,
      name: "Westside Community Camp",
      location: { lat: 37.7819, lng: -122.4317 },
      type: "active",
      date: "2024-03-18",
      donorsRegistered: 32,
    },
  ]);

  // ... (previous state variables)

  const getMarkerIcon = (type) => {
    const icons = {
      urgent: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z",
        fillColor: "#dc2626",
        fillOpacity: 1,
        scale: 2,
      },
      active: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1 14.91V12H8.5L12 6.5 15.5 12H13v4.91c-1.07-.48-2.14-.91-3-1.41z",
        fillColor: "#16a34a",
        fillOpacity: 1,
        scale: 2,
      },
      upcoming: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 2a5 5 0 0 1 5 5c0 1.64-.79 3.09-2 4v-4h-6v4c-1.21-.91-2-2.36-2-4a5 5 0 0 1 5-5z",
        fillColor: "#2563eb",
        fillOpacity: 1,
        scale: 2,
      },
    };
    return icons[type] || icons.upcoming;
  };

  const renderMap = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={{
          styles: darkMode ? require("./darkMapStyle.json") : [],
          disableDefaultUI: true,
        }}
      >
        {camps.map((camp) => (
          <Marker
            key={camp.id}
            position={camp.location}
            icon={getMarkerIcon(camp.type)}
            onClick={() => setSelectedCamp(camp)}
          >
            {selectedCamp?.id === camp.id && (
              <InfoWindow
                position={camp.location}
                onCloseClick={() => setSelectedCamp(null)}
              >
                <div className="dark:text-gray-800">
                  <h3 className="font-bold mb-2">{camp.name}</h3>
                  <p className="text-sm">
                    <FiCalendar className="inline mr-1" />
                    {new Date(camp.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <FiUsers className="inline mr-1" />
                    {camp.donorsRegistered} donors registered
                  </p>
                  <button className="mt-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition">
                    View Details
                  </button>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="flex h-screen overflow-hidden">
        {/* ... (previous sidebar and header code) */}

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* ... (previous header code) */}

          {/* Dashboard Content */}
          {activeView === "camps" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoaded ? (
                  renderMap()
                ) : loadError ? (
                  <div className="bg-red-100 text-red-800 p-4 rounded-xl">
                    Error loading maps
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
                    Loading map...
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">
                    <FiMapPin className="inline mr-2" />
                    Active Donation Camps
                  </h2>
                  <div className="space-y-4">
                    {camps.map((camp) => (
                      <div
                        key={camp.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                        onClick={() => setSelectedCamp(camp)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium dark:text-white">
                            {camp.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              camp.type === "urgent"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/50"
                                : camp.type === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/50"
                            }`}
                          >
                            {camp.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          <FiCalendar className="inline mr-2" />
                          {new Date(camp.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ... (previous other views code) */}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
