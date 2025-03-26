import { useState, useRef } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { motion } from "framer-motion";
import {
  FiHome,
  FiDroplet,
  FiCalendar,
  FiAlertTriangle,
  FiUsers,
  FiSettings,
  FiPlus,
  FiBell,
  FiCheck,
  FiX,
  FiEdit,
  FiTrash2,
  FiMenu,
} from "react-icons/fi";
import AdvancedMarker from "../components/AdvancedMarker";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 37.7749,
  lng: -122.4194,
};

const NGODashboard = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["marker"],
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showCampForm, setShowCampForm] = useState(false);

  const mapRef = useRef(null);
  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  // Mock Data
  const [camps, setCamps] = useState([
    {
      id: 1,
      name: "Central Blood Drive",
      date: "2024-03-15",
      location: { lat: 37.7749, lng: -122.4194 },
      facilities: ["Checkups", "Refreshments"],
      donorsRegistered: 45,
      status: "upcoming",
    },
    {
      id: 2,
      name: "Westside Community Camp",
      date: "2024-03-18",
      location: { lat: 37.7819, lng: -122.4317 },
      facilities: ["Certificates"],
      donorsRegistered: 32,
      status: "active",
    },
  ]);

  const [requests, setRequests] = useState([
    {
      id: 1,
      hospital: "City General",
      bloodType: "O-",
      units: 5,
      urgency: "high",
      status: "pending",
    },
    {
      id: 2,
      hospital: "Westside Clinic",
      bloodType: "A+",
      units: 2,
      urgency: "medium",
      status: "pending",
    },
  ]);

  const [donors, setDonors] = useState([
    {
      id: 1,
      name: "John Doe",
      bloodType: "O+",
      lastDonation: "2024-02-15",
      donations: 5,
      contact: "john@example.com",
    },
    {
      id: 2,
      name: "Jane Smith",
      bloodType: "A-",
      lastDonation: "2024-03-01",
      donations: 2,
      contact: "jane@example.com",
    },
  ]);

  const [bloodStock] = useState([
    { type: "A+", units: 45, status: "safe" },
    { type: "B+", units: 23, status: "low" },
    { type: "O-", units: 12, status: "critical" },
    { type: "AB+", units: 8, status: "safe" },
  ]);

  const NavigationItem = ({ icon, label, notifications = 0 }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center p-3 rounded-lg cursor-pointer ${
        activeView === label.toLowerCase() ? "bg-red-100" : "hover:bg-gray-100"
      }`}
      onClick={() => setActiveView(label.toLowerCase())}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
      {notifications > 0 && (
        <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-1 text-xs">
          {notifications}
        </span>
      )}
    </motion.div>
  );

  const getMarkerContent = (type) => {
    const colors = {
      urgent: "#dc2626",
      active: "#16a34a",
      upcoming: "#2563eb",
    };

    const element = document.createElement("div");
    element.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${
        colors[type] || "#2563eb"
      }">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
      </svg>
    `;
    return { element };
  };

  const CampForm = ({ onAddCamp, onCancel }) => {
    const [campData, setCampData] = useState({
      name: "",
      date: "",
      location: null,
      facilities: [],
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newCamp = {
        ...campData,
        id: camps.length + 1,
        donorsRegistered: 0,
        status: "upcoming",
      };
      onAddCamp(newCamp);
      setCampData({ name: "", date: "", location: null, facilities: [] });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h2 className="text-xl font-bold mb-4">Create New Camp</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Camp Name</label>
            <input
              type="text"
              value={campData.name}
              onChange={(e) =>
                setCampData({ ...campData, name: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={campData.date}
              onChange={(e) =>
                setCampData({ ...campData, date: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            {isLoaded && (
              <div className="h-64 rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  zoom={12}
                  center={center}
                  onClick={(e) =>
                    setCampData({ ...campData, location: e.latLng.toJSON() })
                  }
                >
                  {campData.location && (
                    <AdvancedMarker
                      position={campData.location}
                      map={mapRef.current}
                      content={getMarkerContent("upcoming").element}
                    />
                  )}
                </GoogleMap>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Facilities</label>
            <div className="grid grid-cols-2 gap-4">
              {["Checkups", "Refreshments", "Certificates"].map((facility) => (
                <label key={facility} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={campData.facilities.includes(facility)}
                    onChange={(e) => {
                      const facilities = e.target.checked
                        ? [...campData.facilities, facility]
                        : campData.facilities.filter((f) => f !== facility);
                      setCampData({ ...campData, facilities });
                    }}
                  />
                  <span>{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Create Camp
            </button>
          </div>
        </div>
      </form>
    );
  };

  const RequestCard = ({ request, onStatusChange }) => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{request.hospital}</h3>
            <p className="text-gray-500 mt-1">
              {request.units} units of {request.bloodType}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              request.urgency === "high"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {request.urgency}
          </span>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onStatusChange(request.id, "accepted")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
              request.status === "accepted"
                ? "bg-green-600 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            <FiCheck className="mr-2" /> Accept
          </button>
          <button
            onClick={() => onStatusChange(request.id, "declined")}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
              request.status === "declined"
                ? "bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <FiX className="mr-2" /> Decline
          </button>
        </div>
      </div>
    );
  };

  const DonorTable = () => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleEdit = (donor) => {
      setEditingId(donor.id);
      setEditData({ ...donor });
    };

    const handleSave = (id) => {
      setDonors(
        donors.map((donor) => (donor.id === id ? { ...editData } : donor))
      );
      setEditingId(null);
    };

    const handleDelete = (id) => {
      setDonors(donors.filter((donor) => donor.id !== id));
    };

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Blood Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Last Donation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Contact
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donors.map((donor) => (
              <tr key={donor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">
                  {editingId === donor.id ? (
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    donor.name
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === donor.id ? (
                    <select
                      value={editData.bloodType}
                      onChange={(e) =>
                        setEditData({ ...editData, bloodType: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                        (type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    donor.bloodType
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === donor.id ? (
                    <input
                      type="date"
                      value={editData.lastDonation}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          lastDonation: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    donor.lastDonation
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === donor.id ? (
                    <input
                      value={editData.contact}
                      onChange={(e) =>
                        setEditData({ ...editData, contact: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    donor.contact
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === donor.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSave(donor.id)}
                        className="p-1 text-green-500 hover:text-green-700"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(donor)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(donor.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleAddCamp = (newCamp) => {
    setCamps([...camps, newCamp]);
    setShowCampForm(false);
  };

  const handleRequestStatusChange = (id, status) => {
    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.div
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } border-r transition-all duration-300 bg-white`}
        >
          <div className="p-4">
            <div className="flex items-center mb-8">
              <FiDroplet className="text-red-500 text-2xl" />
              {sidebarOpen && (
                <h1 className="text-xl font-bold ml-2">BloodFlow</h1>
              )}
            </div>

            <nav className="space-y-2">
              <NavigationItem icon={<FiHome />} label="Dashboard" />
              <NavigationItem
                icon={<FiCalendar />}
                label="Camps"
                notifications={
                  camps.filter((c) => c.status === "upcoming").length
                }
              />
              <NavigationItem
                icon={<FiDroplet />}
                label="Blood Stock"
                notifications={
                  bloodStock.filter((b) => b.status === "critical").length
                }
              />
              <NavigationItem
                icon={<FiAlertTriangle />}
                label="Requests"
                notifications={
                  requests.filter((r) => r.status === "pending").length
                }
              />
              <NavigationItem icon={<FiUsers />} label="Donors" />
              <NavigationItem icon={<FiSettings />} label="Settings" />
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu className="text-xl" />
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-2 relative">
                <FiBell className="text-xl" />
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {
                    requests.filter(
                      (r) => r.urgency === "high" && r.status === "pending"
                    ).length
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          {activeView === "dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Blood Stock Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Blood Stock</h2>
                  <div className="space-y-3">
                    {bloodStock.map((stock, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium">{stock.type}</span>
                        <div className="flex items-center">
                          <span className="mr-2">{stock.units}</span>
                          <span
                            className={`w-3 h-3 rounded-full ${
                              stock.status === "safe"
                                ? "bg-green-500"
                                : stock.status === "low"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Camps */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Upcoming Camps</h2>
                    <button
                      onClick={() => setShowCampForm(true)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {camps.slice(0, 2).map((camp) => (
                      <div key={camp.id} className="p-3 border rounded-lg">
                        <h3 className="font-medium">{camp.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <FiCalendar className="inline mr-2" />
                          {new Date(camp.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <FiUsers className="inline mr-2" />
                          {camp.donorsRegistered} donors registered
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Urgent Requests */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Urgent Requests</h2>
                  <div className="space-y-4">
                    {requests
                      .filter((r) => r.urgency === "high")
                      .slice(0, 2)
                      .map((request) => (
                        <div key={request.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">
                                {request.hospital}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.bloodType} • {request.units} units
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                              Urgent
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Camps Map */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Camps Locations</h2>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={12}
                    center={center}
                    onLoad={handleMapLoad}
                  >
                    {camps.map((camp) => (
                      <AdvancedMarker
                        key={camp.id}
                        position={camp.location}
                        map={mapRef.current}
                        content={getMarkerContent(camp.status).element}
                        onClick={() => setSelectedCamp(camp)}
                      />
                    ))}
                    {selectedCamp && (
                      <InfoWindow
                        position={selectedCamp.location}
                        onCloseClick={() => setSelectedCamp(null)}
                      >
                        <div>
                          <h3 className="font-bold mb-2">
                            {selectedCamp.name}
                          </h3>
                          <p className="text-sm">
                            <FiCalendar className="inline mr-1" />
                            {new Date(selectedCamp.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            <FiUsers className="inline mr-1" />
                            {selectedCamp.donorsRegistered} donors registered
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === "camps" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {showCampForm ? (
                <CampForm
                  onAddCamp={handleAddCamp}
                  onCancel={() => setShowCampForm(false)}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Blood Donation Camps</h2>
                    <button
                      onClick={() => setShowCampForm(true)}
                      className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      <FiPlus /> <span>New Camp</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {camps.map((camp) => (
                      <div
                        key={camp.id}
                        className="bg-white p-6 rounded-xl shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold">{camp.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              camp.status === "active"
                                ? "bg-green-100 text-green-800"
                                : camp.status === "upcoming"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {camp.status}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">
                          <FiCalendar className="inline mr-2" />
                          {new Date(camp.date).toLocaleDateString()}
                        </p>

                        <p className="text-gray-600 mb-4">
                          <FiUsers className="inline mr-2" />
                          {camp.donorsRegistered} donors registered
                        </p>

                        {isLoaded && (
                          <div className="h-40 rounded-lg overflow-hidden mb-4">
                            <GoogleMap
                              mapContainerStyle={{
                                height: "100%",
                                width: "100%",
                              }}
                              zoom={14}
                              center={camp.location}
                              options={{ disableDefaultUI: true }}
                            >
                              <AdvancedMarker
                                position={camp.location}
                                map={mapRef.current}
                                content={getMarkerContent(camp.status).element}
                              />
                            </GoogleMap>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium mb-1">
                              Facilities:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {camp.facilities.map((facility, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="text-blue-500 hover:text-blue-700">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeView === "blood stock" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Blood Inventory</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Overview */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Current Stock</h3>
                  <div className="space-y-4">
                    {bloodStock.map((stock, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-3 ${
                              stock.status === "safe"
                                ? "bg-green-500"
                                : stock.status === "low"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></span>
                          <span className="font-medium">{stock.type}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>{stock.units} units</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                stock.status === "safe"
                                  ? "bg-green-500"
                                  : stock.status === "low"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(stock.units * 3, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Management */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Update Stock</h3>
                  <div className="space-y-4">
                    {bloodStock.map((stock, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{stock.type}</span>
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                            -
                          </button>
                          <span className="w-10 text-center">
                            {stock.units}
                          </span>
                          <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expiry Alerts */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Expiry Alerts</h3>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    <span className="font-medium">3 units of O+</span> will
                    expire in 5 days
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === "requests" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Hospital Requests</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onStatusChange={handleRequestStatusChange}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeView === "donors" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Donor Management</h2>
                <button className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                  <FiPlus /> <span>Add Donor</span>
                </button>
              </div>

              <DonorTable />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
