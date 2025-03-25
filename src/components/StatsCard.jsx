import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ icon, value, label, prefix = "", duration = 1 }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
    >
      <div className="text-red-500 mb-4">{icon}</div>
      <h3 className="text-3xl font-bold text-gray-800">
        {prefix}
        {value}
      </h3>
      <p className="text-gray-500">{label}</p>
    </motion.div>
  );
};

export default StatsCard;
