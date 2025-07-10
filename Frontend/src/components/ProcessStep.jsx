import { motion } from 'framer-motion';

const ProcessStep = ({ number, title, content, icon, color, delay }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -10 }}
  >
    <div
      className={`${color} w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl mb-6`}
    >
      {number}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{content}</p>
    <div className="mt-6 text-red-500 dark:text-red-400 text-3xl">{icon}</div>
  </motion.div>
);

export default ProcessStep;
