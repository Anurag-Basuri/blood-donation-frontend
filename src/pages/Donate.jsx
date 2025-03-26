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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Dark Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-3 rounded-full bg-red-500/20 backdrop-blur-sm z-50 shadow-lg"
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌞" : "🌙"}
      </motion.button>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <div className="heartbeat-animation">
            <div className="pulse-line"></div>
            <div className="heart">❤️</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent" />
        </div>

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 text-center px-4"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            💖 Your Contribution, Their Lifeline!
          </motion.h1>
          
          <motion.p className="text-xl mb-8 text-red-100/80" variants={fadeInUp}>
            Every Drop Counts in Saving Lives
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-4 mb-12" variants={fadeInUp}>
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-red-800/30 rounded-xl backdrop-blur-sm hover:bg-red-800/40 transition-colors"
              >
                <div className="text-2xl md:text-3xl text-red-300">
                  {stat.icon} {stat.value}
                </div>
                <div className="text-sm text-red-200/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="flex flex-col md:flex-row justify-center gap-4" variants={fadeInUp}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-red-600 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all"
            >
              🏥 Support Blood Camps
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-red-800 rounded-xl font-semibold shadow-lg hover:bg-red-900 transition-all"
            >
              🚑 Emergency Support
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Donate Section */}
      <section className="py-20 px-4 md:px-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl md:text-5xl text-center mb-16 font-bold text-red-400"
        >
          Your Contribution Matters
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {donationTiers.map((tier, index) => (
            <motion.div
              key={tier.amount}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ delay: index * 0.2 }}
              className={`p-8 rounded-3xl backdrop-blur-sm border ${
                darkMode 
                  ? "border-red-800/50 bg-red-900/20 hover:bg-red-900/30" 
                  : "border-red-200 bg-red-50 hover:bg-red-100"
              } transition-all`}
            >
              <div className="text-4xl md:text-5xl font-bold mb-4 text-red-400">
                ₹{tier.amount}
              </div>
              <p className={`text-lg ${darkMode ? "text-red-300" : "text-red-600"}`}>
                {tier.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transparency Section */}
      <section className={`py-20 px-4 md:px-8 ${darkMode ? "bg-red-900/10" : "bg-red-50"}`}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl text-center mb-16 font-bold text-red-400"
          >
            Where Your Money Goes
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Fund Breakdown */}
            <motion.div 
              className="space-y-6"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
            >
              <div className={`p-8 rounded-3xl ${darkMode ? "bg-red-900/20" : "bg-white"} shadow-xl`}>
                <h3 className="text-2xl font-bold mb-6 text-red-300">Fund Breakdown</h3>
                <div className="space-y-4">
                  {[
                    ["Donation Camps", "40%", "bg-red-400"],
                    ["Medical Facilities", "30%", "bg-red-300"],
                    ["Awareness Campaigns", "20%", "bg-red-200"],
                    ["Administration", "10%", "bg-red-100"],
                  ].map(([label, percentage, color]) => (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between text-red-100">
                        <span>{label}</span>
                        <span>{percentage}</span>
                      </div>
                      <div className="h-2 bg-red-900/20 rounded-full">
                        <div 
                          className={`h-full rounded-full ${color}`}
                          style={{ width: percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Impact Stories */}
            <motion.div 
              className="space-y-6"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
            >
              <div className={`p-8 rounded-3xl ${darkMode ? "bg-red-900/20" : "bg-white"} shadow-xl`}>
                <h3 className="text-2xl font-bold mb-6 text-red-300">Real Impact Stories</h3>
                <div className="space-y-6">
                  {[
                    "Your donations helped save my daughter's life during emergency surgery.",
                    "Blood camps organized through your support helped 50+ patients last month.",
                    "Emergency funds provided blood units to accident victims within hours."
                  ].map((story, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl ${darkMode ? "bg-red-900/30" : "bg-red-100"} transition-all hover:scale-[1.02]`}
                    >
                      <p className={`${darkMode ? "text-red-200" : "text-red-600"}`}>{story}</p>
                      <div className={`mt-2 ${darkMode ? "text-red-400" : "text-red-500"}`}>
                        - Anonymous Donor
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl text-center mb-12 font-bold text-red-400"
          >
            Make a Difference
          </motion.h2>
          
          <div className={`p-8 rounded-3xl ${darkMode ? "bg-red-900/20" : "bg-red-50"} shadow-xl`}>
            <form className="space-y-8">
              {/* Donation Type */}
              <div className="grid grid-cols-2 gap-4">
                {["one-time", "monthly"].map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setDonationType(type)}
                    className={`p-4 rounded-xl transition-all ${
                      donationType === type
                        ? "bg-red-600 text-white shadow-lg"
                        : `${darkMode ? "bg-red-900/30" : "bg-white"} hover:bg-red-800/20`
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Donation
                  </motion.button>
                ))}
              </div>

              {/* Amount Selection */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-red-300">Select Amount (₹)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[500, 1000, 5000].map((amt) => (
                    <motion.button
                      key={amt}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`p-4 rounded-xl transition-all ${
                        amount === amt
                          ? "bg-red-600 text-white shadow-lg"
                          : `${darkMode ? "bg-red-900/30" : "bg-white"} hover:bg-red-800/20`
                      }`}
                    >
                      {amt}
                    </motion.button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  min="100"
                  step="100"
                  onChange={(e) => setAmount(Math.max(100, Number(e.target.value)))}
                  className={`w-full p-4 rounded-xl transition-all outline-none ${
                    darkMode 
                      ? "bg-red-900/30 text-red-100 focus:bg-red-900/40" 
                      : "bg-white text-red-900 focus:bg-red-100"
                  }`}
                  placeholder="Custom Amount"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-red-600 rounded-xl font-semibold text-lg text-white hover:bg-red-700 transition-all shadow-lg"
              >
                Donate Now
              </motion.button>
            </form>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .heartbeat-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .pulse-line {
          position: absolute;
          top: 50%;
          width: 100%;
          height: 4px;
          background: rgba(255, 50, 50, 0.3);
          animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        .heart {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 20rem;
          animation: beat 1.5s infinite ease-in-out;
          opacity: 0.1;
          text-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
        }

        @keyframes beat {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes pulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Donate;