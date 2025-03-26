import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ContactPage() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      {/* Navbar with Dark Mode Toggle */}
      <div className="flex justify-between items-center p-5 shadow-md bg-opacity-80 backdrop-blur-md">
        <h1 className="text-2xl font-bold">Contact Us</h1>
        <button
          className="p-2 rounded-full text-xl bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Hero Section */}
      <div className="text-center py-16 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-gray-800 dark:to-gray-900">
        <h2 className="text-4xl font-bold">We're Here to Help</h2>
        <p className="mt-4 text-lg opacity-80">
          For NGOs and Hospitals – Verified support and collaboration
        </p>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto my-10 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-md border dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded-md border dark:border-gray-700 dark:bg-gray-900"
          />
          <textarea
            rows="5"
            placeholder="Your Message"
            className="w-full p-3 rounded-md border dark:border-gray-700 dark:bg-gray-900"
          ></textarea>
          <button className="w-full py-3 bg-blue-600 dark:bg-indigo-600 text-white rounded-md hover:scale-105 transition">
            Submit
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm opacity-80 dark:opacity-60">
        © 2025 Vibranta | Helping NGOs & Hospitals
      </footer>
    </div>
  );
}
