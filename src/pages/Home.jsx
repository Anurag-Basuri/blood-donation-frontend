import React, { useState, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { FiDroplet, FiHeart, FiUsers, FiClock } from "react-icons/fi";
import {
  TestimonialCard,
  StatsCard,
  SectionHeading,
  GradientButton,
} from "./components";

const Home = () => {
  const [stats, setStats] = useState({ donors: 0, lives: 0, drives: 0 });
  const controls = useAnimation();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
      // Simulate dynamic data loading
      setStats({ donors: 10000, lives: 5000, drives: 1000 });
    }
  }, [controls, inView]);

  return (
    <div className="font-sans bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-95" />
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
          >
            <span className="block mb-4">Give Blood,</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-100">
              Save Lives
            </span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-red-100 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Every drop counts in the river of life
          </motion.p>
          <GradientButton
            text="Join Now"
            icon={<FiDroplet className="ml-2" />}
            className="px-8 py-4 text-lg"
          />
        </motion.div>

        {/* Animated blood cells */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 border-2 border-red-200 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white" ref={ref}>
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Impact"
            subtitle="Together we're making a difference"
            icon={<FiHeart className="text-red-500" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <StatsCard
              icon={<FiUsers className="text-4xl" />}
              value={stats.donors}
              label="Active Donors"
              prefix="+"
              duration={2}
            />
            <StatsCard
              icon={<FiHeart className="text-4xl" />}
              value={stats.lives}
              label="Lives Saved"
              prefix="+"
              duration={2.5}
            />
            <StatsCard
              icon={<FiClock className="text-4xl" />}
              value={stats.drives}
              label="Drives Organized"
              prefix="+"
              duration={3}
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="How It Works"
            subtitle="Three simple steps to save lives"
            icon={<FiDroplet className="text-red-500" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div className="process-card" whileHover={{ y: -10 }}>
              <div className="number-circle">1</div>
              <h3 className="text-xl font-semibold mb-4">Register</h3>
              <p>Quick signup with health questionnaire</p>
            </motion.div>

            {/* Add other process steps similarly */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Hero Stories"
            subtitle="Hear from our donors"
            icon={<FiUsers className="text-red-500" />}
          />

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TestimonialCard
                quote="Donating blood was the most rewarding experience..."
                author="Sarah Johnson"
                role="Regular Donor"
                avatar="/avatars/sarah.jpg"
              />
              {/* Add more testimonials */}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Be a Hero?
            </h2>
            <p className="text-red-100 mb-8 text-xl">
              Your single donation can save up to 3 lives
            </p>
            <div className="flex justify-center space-x-4">
              <GradientButton
                text="Donate Now"
                className="px-10 py-5 text-xl"
                glow
              />
              <button className="px-10 py-5 text-xl text-white border-2 border-white rounded-full hover:bg-white hover:text-red-600 transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Footer */}
      <footer className="bg-gray-900 text-white py-12">
        {/* Footer content */}
      </footer>
    </div>
  );
};

export default Home;
