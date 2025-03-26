import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import heartbeatAnimation from "../assets/heartbeat.json";

const Donate = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [donationType, setDonationType] = useState("one-time");
  const [amount, setAmount] = useState(500);

  const impactStats = [
    { label: "Lives Saved", value: "500+", icon: "🚑" },
    { label: "Donations Processed", value: "1,200", icon: "🩸" },
    { label: "Camps Organized", value: "80+", icon: "❤️" },
  ];

  const donationTiers = [
    { amount: 500, description: "Supports a donor's medical checkup" },
    { amount: 1000, description: "Helps set up a blood donation camp" },
    { amount: 5000, description: "Covers logistics for 50+ donors" },
  ];

  // dark mode classes for all sections
  const sectionClasses = `${
    darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
  } transition-colors duration-300`;

  useEffect(() => {
    console.log("Animation data:", heartbeatAnimation);
  }, []);

  return (
    <div className={`min-h-screen ${sectionClasses}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-3 rounded-full bg-red-500/20 backdrop-blur-sm z-50"
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌞" : "🌙"}
      </button>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/50 to-transparent" />
        <Player
          autoplay
          loop
          src={heartbeatAnimation}
          className="absolute inset-0 w-full h-full opacity-20 z-0"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            💖 Your Contribution, Their Lifeline!
          </h1>
          <p className="text-xl mb-8">Every Drop Counts in Saving Lives</p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-red-800/30 rounded-xl backdrop-blur-sm"
              >
                <div className="text-2xl md:text-3xl">
                  {stat.icon} {stat.value}
                </div>
                <div className="text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 md:px-8 md:py-4 bg-red-600 rounded-xl font-semibold"
            >
              🏥 Support Blood Camps
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 md:px-8 md:py-4 bg-red-800 rounded-xl font-semibold"
            >
              🚑 Emergency Support
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Why Donate Section - Fixed responsive grid */}
      <section className="py-20 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl text-center mb-12 md:mb-16">
          Your Contribution Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {donationTiers.map((tier, index) => (
            <motion.div
              key={tier.amount}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ delay: index * 0.2 }}
              className={`p-6 md:p-8 rounded-2xl border ${
                darkMode
                  ? "border-red-800/50 bg-red-900/20"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="text-3xl md:text-4xl font-bold mb-4">
                ₹{tier.amount}
              </div>
              <p className={`${darkMode ? "text-red-300" : "text-red-600"}`}>
                {tier.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transparency Section - Completed fund breakdown */}
      <section
        className={`py-20 px-4 md:px-8 ${
          darkMode ? "bg-red-900/10" : "bg-red-50"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-12 md:mb-16">
            Where Your Money Goes
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            <div className="space-y-4">
              <div
                className={`p-6 rounded-xl ${
                  darkMode ? "bg-red-900/20" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-bold mb-4">Fund Breakdown</h3>
                <div className="space-y-3">
                  {[
                    ["Donation Camps", "40%"],
                    ["Medical Facilities", "30%"],
                    ["Awareness Campaigns", "20%"],
                    ["Administration", "10%"],
                  ].map(([label, percentage]) => (
                    <div key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span className="text-red-400">{percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className={`p-6 rounded-xl ${
                darkMode ? "bg-red-900/20" : "bg-white"
              }`}
            >
              <h3 className="text-xl font-bold mb-4">Real Impact Stories</h3>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-red-900/30" : "bg-red-100"
                  }`}
                >
                  "Your donations helped save my daughter's life during
                  emergency surgery."
                  <div
                    className={`mt-2 ${
                      darkMode ? "text-red-300" : "text-red-600"
                    }`}
                  >
                    - Ramesh, Mumbai
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form Section - Added form validation */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-8 md:mb-12">
            Make a Difference
          </h2>
          <div
            className={`p-6 md:p-8 rounded-2xl ${
              darkMode ? "bg-red-900/20" : "bg-red-50"
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle donation submission
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setDonationType("one-time")}
                  className={`p-4 rounded-xl transition-colors ${
                    donationType === "one-time"
                      ? "bg-red-600 text-white"
                      : darkMode
                      ? "bg-red-900/30 hover:bg-red-900/40"
                      : "bg-white hover:bg-red-100"
                  }`}
                >
                  One-time Donation
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType("monthly")}
                  className={`p-4 rounded-xl transition-colors ${
                    donationType === "monthly"
                      ? "bg-red-600 text-white"
                      : darkMode
                      ? "bg-red-900/30 hover:bg-red-900/40"
                      : "bg-white hover:bg-red-100"
                  }`}
                >
                  Monthly Support
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold">Select Amount (₹)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`p-4 rounded-xl transition-colors ${
                        amount === amt
                          ? "bg-red-600 text-white"
                          : darkMode
                          ? "bg-red-900/30 hover:bg-red-900/40"
                          : "bg-white hover:bg-red-100"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  min="100"
                  step="100"
                  onChange={(e) =>
                    setAmount(Math.max(100, Number(e.target.value)))
                  }
                  className={`w-full p-4 rounded-xl ${
                    darkMode
                      ? "bg-red-900/30 focus:bg-red-900/40"
                      : "bg-white focus:bg-red-100"
                  } outline-none`}
                  placeholder="Custom Amount"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-red-600 rounded-xl font-semibold text-lg text-white hover:bg-red-700 transition-colors"
              >
                Donate Now
              </motion.button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;
