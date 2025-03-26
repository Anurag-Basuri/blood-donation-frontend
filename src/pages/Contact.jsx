import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiFile } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Contact = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
    file: null,
  });

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Form handling
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 p-3 rounded-full bg-opacity-20 backdrop-blur-sm z-50"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-gradient-flow" />
        <div className="relative h-full flex items-center justify-center p-6">
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl font-bold text-white drop-shadow-glow">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300">We value your support</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 p-8 rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-gray-800/50 border border-white/20 shadow-xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Organization Name"
                id="orgName"
                value={formData.orgName}
                onChange={(e) =>
                  setFormData({ ...formData, orgName: e.target.value })
                }
              />
              <InputField
                label="Contact Person"
                id="contactName"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
              />
              <InputField
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <InputField
                label="Phone"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-300">Message</label>
              <textarea
                className="w-full p-4 bg-white/5 rounded-lg border border-gray-300/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <FileUpload file={formData.file} onChange={handleFileChange} />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/30"
              type="submit"
            >
              Submit Request
            </motion.button>
          </div>
        </motion.form>

        {/* Contact Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-2xl bg-white/5 dark:bg-gray-800/50 border border-white/20 backdrop-blur-lg shadow-xl h-fit"
        >
          <div className="space-y-8">
            <ContactInfo
              icon={<FiMail />}
              title="Email"
              value="contact@lifesaver.org"
            />
            <ContactInfo
              icon={<FiPhone />}
              title="24/7 Helpline"
              value="+1 800 123 4567"
            />
            <ContactInfo
              icon={<FiMapPin />}
              title="Headquarters"
              value="123 Life Saver Street, Global City"
            />

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Connect With Us
              </h3>
              <div className="flex space-x-4">
                <SocialIcon icon={<FaFacebook />} />
                <SocialIcon icon={<FaTwitter />} />
                <SocialIcon icon={<FaLinkedin />} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Reusable Components
const InputField = ({ label, id, type = "text", value, onChange }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-gray-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      className="w-full p-4 bg-white/5 rounded-lg border border-gray-300/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      value={value}
      onChange={onChange}
    />
  </div>
);

const FileUpload = ({ file, onChange }) => (
  <div className="space-y-2">
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <FiFile className="text-gray-400" />
      <span className="text-gray-300">Attach Documents</span>
      <input type="file" className="hidden" onChange={onChange} />
    </label>
    {file && <p className="text-sm text-gray-400">{file.name}</p>}
  </div>
);

const ContactInfo = ({ icon, title, value }) => (
  <div className="flex items-start gap-4">
    <div className="text-2xl text-blue-500">{icon}</div>
    <div>
      <h4 className="text-gray-400 font-medium">{title}</h4>
      <p className="text-white">{value}</p>
    </div>
  </div>
);

const SocialIcon = ({ icon }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-gray-300 hover:text-white"
  >
    {icon}
  </motion.div>
);

export default Contact;
