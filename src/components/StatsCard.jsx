import { motion } from "framer-motion";

const StatsCard = ({ icon, value, label, prefix, duration, shimmer }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
    >
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity -rotate-45" />
      )}
      <div className="text-red-500 mb-4">{icon}</div>
      <h3 className="text-4xl font-bold text-gray-800 mb-2">
        {prefix}
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {value}
        </motion.span>
      </h3>
      <p className="text-gray-600 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatsCard;
