import React, { useState, useEffect } from "react";
import { useInView, useAnimation, motion } from "framer-motion";
import {
  FiDroplet,
  FiHeart,
  FiUsers,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";
import GradientButton from "../components/GradientButton.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TestimonialCarousel from "../components/TestimonialCarousel.jsx";
import ProcessStep from "../components/ProcessStep.jsx";

const Home = () => {
  const [stats, setStats] = useState({ donors: 0, lives: 0, drives: 0 });
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
      animateStats();
    }
  }, [controls, inView]);

  const animateStats = () => {
    setStats({ donors: 0, lives: 0, drives: 0 });
    setTimeout(
      () => setStats({ donors: 10000, lives: 5000, drives: 1000 }),
      500
    );
  };

  const processSteps = [
    {
      number: 1,
      title: "Register",
      content: "Quick signup with health questionnaire",
      icon: <FiUsers />,
      color: "bg-red-400",
    },
    {
      number: 2,
      title: "Screen",
      content: "Quick health check & eligibility verification",
      icon: <FiHeart />,
      color: "bg-red-500",
    },
    {
      number: 3,
      title: "Donate",
      content: "Safe & comfortable donation process",
      icon: <FiDroplet />,
      color: "bg-red-600",
    },
  ];

  const testimonials = [
    {
      quote: "Donating blood was the most rewarding experience of my life.",
      author: "Sarah Johnson",
      role: "Regular Donor",
      avatar: "/avatars/sarah.jpg",
    },
    {
      quote: "I am grateful to the donors who saved my life.",
      author: "John Doe",
      role: "Recipient",
      avatar: "/avatars/john.jpg",
    },
    {
      quote: "Every donation makes a difference. Be a hero today!",
      author: "Emily Davis",
      role: "Volunteer",
      avatar: "/avatars/emily.jpg",
    },
  ];

  const WaveDivider = () => (
    <svg
      className="absolute bottom-0 left-0 right-0 text-white"
      viewBox="0 0 1440 120"
    >
      <path
        fill="currentColor"
        d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
      />
    </svg>
  );

  return (
    <div className="font-sans bg-gradient-to-b from-red-50 to-white overflow-hidden">
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
            className="px-8 py-4 text-lg hover:shadow-xl"
            glow
          />
        </motion.div>

        <WaveDivider />

        {/* Animated Blood Cells */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 border-2 border-red-200/30 rounded-full pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.8, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white" ref={ref}>
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Impact"
            subtitle="Together we're making waves"
            icon={<FiHeart className="text-red-500" />}
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
          >
            <StatsCard
              icon={<FiUsers className="text-4xl" />}
              value={stats.donors}
              label="Active Donors"
              prefix="+"
              duration={2}
              shimmer
            />
            <StatsCard
              icon={<FiHeart className="text-4xl" />}
              value={stats.lives}
              label="Lives Saved"
              prefix="+"
              duration={2.5}
              shimmer
            />
            <StatsCard
              icon={<FiClock className="text-4xl" />}
              value={stats.drives}
              label="Drives Organized"
              prefix="+"
              duration={3}
              shimmer
            />
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 relative">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Donation Journey"
            subtitle="Simple steps to save lives"
            icon={<FiDroplet className="text-red-500" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative z-10">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={index}
                number={step.number}
                title={step.title}
                content={step.content}
                icon={step.icon}
                color={step.color}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50 to-transparent" />
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Hero Stories"
            subtitle="Voices from our community"
            icon={<FiUsers className="text-red-500" />}
          />
          <TestimonialCarousel testimonials={testimonials} />;
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-red-600 to-red-700 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 50 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make History?
            </h2>
            <p className="text-red-100 mb-8 text-xl max-w-2xl mx-auto">
              Your single act of kindness can ignite a chain of life-saving
              miracles
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <GradientButton
                text="Donate Now"
                className="px-12 py-6 text-xl hover:shadow-2xl"
                glow
                icon={<FiDroplet className="ml-3" />}
              />
              <button className="px-12 py-6 text-xl text-white border-2 border-white rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Learn More{" "}
                <FiChevronRight className="animate-horizontal-bounce" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Animated Pulse Effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-red-500 rounded-full opacity-10 animate-ping-slow" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} BloodHero. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
