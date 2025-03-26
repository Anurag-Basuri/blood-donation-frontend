import React, { useState, useEffect } from "react";
import { useInView, useAnimation, motion } from "framer-motion";
import {
  FiDroplet,
  FiHeart,
  FiUsers,
  FiClock,
  FiChevronRight,
  FiMapPin,
  FiSearch,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
} from "react-icons/fi";
import SectionHeading from "../components/SectionHeading.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TestimonialCarousel from "../components/TestimonialCarousel.jsx";
import ProcessStep from "../components/ProcessStep.jsx";

const Home = () => {
  const [stats, setStats] = useState({ donors: 0, units: 0, lives: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    // Check user preference for dark mode
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);

    // Apply the dark mode class to the HTML element
    document.documentElement.classList.toggle("dark", prefersDark);

    if (inView) {
      controls.start({ opacity: 1, y: 0 });
      animateStats();
    }
  }, [controls, inView]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  const animateStats = () => {
    setStats({ donors: 0, units: 0, lives: 0 });
    setTimeout(() => {
      // Simulated API call with realistic numbers
      setStats({
        donors: 12456,
        units: 8453,
        lives: 25359,
      });
    }, 500);
  };

  const processSteps = [
    {
      number: 1,
      title: "Find",
      content: "Locate nearest donation centers using our smart map",
      icon: <FiMapPin />,
      color: "bg-red-400 dark:bg-red-500",
    },
    {
      number: 2,
      title: "Request",
      content: "Schedule your donation appointment in 2 clicks",
      icon: <FiSearch />,
      color: "bg-red-500 dark:bg-red-600",
    },
    {
      number: 3,
      title: "Donate",
      content: "Safe & comfortable donation experience",
      icon: <FiDroplet />,
      color: "bg-red-600 dark:bg-red-700",
    },
  ];

  const testimonials = [
    {
      quote:
        "Donating blood was the most rewarding experience of my life. The staff made it so easy!",
      author: "Sarah Johnson",
      role: "Regular Donor (3+ years)",
      avatar: "/avatars/sarah.jpg",
    },
    {
      quote:
        "I'm alive today because of generous donors. Thank you for this life-saving platform.",
      author: "Michael Chen",
      role: "Blood Recipient",
      avatar: "/avatars/michael.jpg",
    },
    {
      quote:
        "As a doctor, I've seen firsthand how blood donations save lives. This platform makes it accessible to everyone.",
      author: "Dr. Emily Davis",
      role: "Cardiologist",
      avatar: "/avatars/emily.jpg",
    },
  ];

  const WaveDivider = () => (
    <svg
      className="absolute bottom-0 left-0 right-0 text-white dark:text-gray-900"
      viewBox="0 0 1440 120"
    >
      <path
        fill="currentColor"
        d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
      />
    </svg>
  );

  const GradientButton = ({
    text,
    icon,
    className = "",
    glow = false,
    onClick,
  }) => {
    return (
      <button
        onClick={onClick}
        className={`bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white font-semibold rounded-full px-6 py-3 flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          glow ? "shadow-lg shadow-red-500/50 dark:shadow-red-600/50" : ""
        } ${className}`}
        aria-label={text}
      >
        {text}
        {icon && <span className="ml-2">{icon}</span>}
      </button>
    );
  };

  return (
    <div
      className={`font-sans bg-gradient-to-b from-red-50 to-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 overflow-hidden ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg"
        aria-label="Toggle dark mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/blood-donation-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <motion.div
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
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
            className="text-xl md:text-2xl text-red-100 dark:text-red-200 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Every 2 seconds someone needs blood. Your donation can make the
            difference.
          </motion.p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <GradientButton
              text="Find a Donation Center"
              icon={<FiMapPin className="ml-2" />}
              className="px-8 py-4 text-lg hover:shadow-xl"
              glow
            />
            <button className="px-8 py-4 text-lg text-white border-2 border-white rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
              Learn More{" "}
              <FiChevronRight className="ml-2 animate-horizontal-bounce" />
            </button>
          </div>
        </motion.div>

        <WaveDivider />
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white dark:bg-gray-900" ref={ref}>
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Impact"
            subtitle="Together we're saving lives"
            icon={<FiHeart className="text-red-500 dark:text-red-400" />}
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
              icon={<FiDroplet className="text-4xl" />}
              value={stats.units}
              label="Units Donated"
              prefix="+"
              duration={2.5}
              shimmer
            />
            <StatsCard
              icon={<FiHeart className="text-4xl" />}
              value={stats.lives}
              label="Lives Impacted"
              prefix="+"
              duration={3}
              shimmer
            />
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 relative">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="How It Works"
            subtitle="Simple steps to become a hero"
            icon={<FiDroplet className="text-red-500 dark:text-red-400" />}
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50 dark:from-gray-900/50 to-transparent" />
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Hero Stories"
            subtitle="Voices from our community"
            icon={<FiUsers className="text-red-500 dark:text-red-400" />}
          />
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Emergency CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/blood-cells-pattern.png')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 50 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Urgent Need for Donors!
            </h2>
            <p className="text-red-100 dark:text-red-200 mb-8 text-xl max-w-2xl mx-auto">
              Hospitals are facing critical shortages. Your donation today can
              save up to 3 lives.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <GradientButton
                text="Find Nearest Center"
                className="px-12 py-6 text-xl hover:shadow-2xl"
                glow
                icon={<FiMapPin className="ml-3" />}
              />
              <button className="px-12 py-6 text-xl text-white border-2 border-white rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Emergency Request{" "}
                <FiChevronRight className="animate-horizontal-bounce" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pulsing emergency effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-red-500 rounded-full opacity-10 animate-ping-slow" />
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FiDroplet className="text-red-500 mr-2" /> BloodHero
            </h3>
            <p className="text-gray-400">
              Connecting donors with those in need since 2023
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Donate Blood
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Request Blood
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  Eligibility
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>24/7 Helpline: 1-800-HELP-NOW</li>
              <li>emergency@bloodhero.com</li>
              <li>Support: help@bloodhero.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiFacebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiTwitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiLinkedin className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiYoutube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} BloodHero. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
