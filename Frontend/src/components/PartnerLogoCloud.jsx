import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PartnerLogoCloud = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const partners = [
    { name: 'Red Cross', logo: '/partners/red-cross.svg' },
    { name: 'WHO', logo: '/partners/who.svg' },
    { name: 'UNICEF', logo: '/partners/unicef.svg' },
    { name: 'Blood Donors Association', logo: '/partners/bda.svg' },
    { name: 'Global Health', logo: '/partners/global-health.svg' },
    { name: 'LifeSave', logo: '/partners/lifesave.svg' },
    { name: 'HealthFirst', logo: '/partners/healthfirst.svg' },
    { name: 'Donate Life', logo: '/partners/donate-life.svg' },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  if (!isClient) {
    return null; // or a loading state
  }

  return (
    <motion.div
      className="py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={container}
    >
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        {/* Logo grid */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 place-items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover="hover"
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all w-full max-w-[180px] h-24 flex items-center justify-center"
            >
              <div className="relative w-full h-full grayscale hover:grayscale-0 transition-all duration-300">
                {/* Regular img tag for React.js */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="object-contain p-2 w-full h-full"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated border */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 border border-dashed border-red-200 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PartnerLogoCloud;
