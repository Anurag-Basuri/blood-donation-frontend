import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import {
  FiDroplet,
  FiHeart,
  FiUsers,
  FiCheckCircle,
  FiGlobe,
  FiMenu,
  FiX,
  FiChevronDown,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiMapPin,
} from "react-icons/fi";
import SectionHeading from "../components/SectionHeading.jsx";
import StatsCard from "../components/StatsCard.jsx";
import TestimonialCarousel from "../components/TestimonialCarousel.jsx";
import PartnerLogoCloud from "../components/PartnerLogoCloud.jsx";

const InteractiveGlobe = dynamic(
  () => import("../components/InteractiveGlobe"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gradient-to-r from-red-100 to-red-100 animate-pulse rounded-2xl" />
    ),
  }
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn] = useState(false); // Simulated login state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Donate", href: "/donate" },
    { name: "Contact", href: "/contact" },
    { name: "Dashboard", href: "/userdashboard" },
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <FiDroplet className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-bold text-red-800">
              BloodHero
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-red-700 hover:text-red-600 font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Register
                </a>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-red-700 hover:text-red-600"
                >
                  <span>Profile</span>
                  <FiChevronDown className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                  >
                    <a
                      href="/profile"
                      className="block px-4 py-2 hover:bg-red-50"
                    >
                      View Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 hover:bg-red-50"
                    >
                      Settings
                    </a>
                    <a
                      href="/logout"
                      className="block px-4 py-2 hover:bg-red-50"
                    >
                      Logout
                    </a>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-red-700 hover:text-red-600"
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute w-full bg-white shadow-lg pb-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-red-700 hover:bg-red-50"
              >
                {link.name}
              </a>
            ))}
            <div className="mt-4 px-4 space-y-2">
              <a
                href="/login"
                className="block w-full px-4 py-2 text-center text-red-700 hover:bg-red-50 rounded-lg"
              >
                Login
              </a>
              <a
                href="/register"
                className="block w-full px-4 py-2 text-center bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Register
              </a>
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
};

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const stats = [
    {
      value: "100K+",
      label: "Lives Saved",
      icon: <FiHeart className="text-red-600" />,
    },
    {
      value: "50K+",
      label: "Active Donors",
      icon: <FiUsers className="text-red-600" />,
    },
    {
      value: "1.5K+",
      label: "Blood Drives",
      icon: <FiDroplet className="text-red-600" />,
    },
    {
      value: "100+",
      label: "Cities Covered",
      icon: <FiGlobe className="text-red-600" />,
    },
  ];

  const features = [
    {
      title: "Fast Matching",
      icon: <FiCheckCircle className="text-red-600" />,
      description: "Instant donor-recipient connection system",
    },
    {
      title: "Verified Network",
      icon: <FiCheckCircle className="text-red-600" />,
      description: "Rigorous verification for safety and trust",
    },
    {
      title: "24/7 Availability",
      icon: <FiCheckCircle className="text-red-600" />,
      description: "Emergency support anytime, anywhere",
    },
    {
      title: "Free Service",
      icon: <FiCheckCircle className="text-red-600" />,
      description: "Community-driven, zero-cost platform",
    },
  ];

  const timelineItems = [
    {
      year: "2000",
      title: "Foundation",
      description: "The journey begins with our first blood drive.",
    },
    {
      year: "2005",
      title: "Expansion",
      description: "Expanded to 10 cities across the country.",
    },
    {
      year: "2010",
      title: "Milestone",
      description: "Reached 1 million blood donations milestone.",
    },
    {
      year: "2020",
      title: "Global Reach",
      description: "Launched the global blood donation initiative.",
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
  ];

  const companyLogos = [
    {
      src: "/logos/hospital1.png",
      alt: "City General Hospital",
      url: "https://www.citygeneralhospital.org",
    },
    {
      src: "/logos/hospital2.png",
      alt: "Red Cross",
      url: "https://www.redcross.org",
    },
    {
      src: "/logos/hospital3.png",
      alt: "LifeBlood Foundation",
      url: "https://www.lifeblood.org",
    },
  ];

  const globalStats = [
    {
      icon: <FiUsers className="text-red-500" />,
      value: "1.2M+",
      label: "Total Donors",
      color: "text-red-500",
    },
    {
      icon: <FiDroplet className="text-red-600" />,
      value: "850K+",
      label: "Units Collected",
      color: "text-red-600",
    },
    {
      icon: <FiMapPin className="text-red-700" />,
      value: "92",
      label: "Countries Reached",
      color: "text-red-700",
    },
    {
      icon: <FiHeart className="text-red-800" />,
      value: "3.5M+",
      label: "Lives Impacted",
      color: "text-red-800",
    },
  ];

  const topCountries = [
    { name: "United States", donations: 245000 },
    { name: "India", donations: 187000 },
    { name: "United Kingdom", donations: 132000 },
    { name: "Germany", donations: 98000 },
    { name: "Canada", donations: 87000 },
  ];

  const globeData = [
    {
      lat: 37.7749,
      lng: -122.4194,
      label: "San Francisco, USA",
      value: "500+ Donations",
    },
    {
      lat: 28.6139,
      lng: 77.209,
      label: "New Delhi, India",
      value: "1,200+ Donations",
    },
    {
      lat: 51.5074,
      lng: -0.1278,
      label: "London, UK",
      value: "800+ Donations",
    },
    {
      lat: -33.8688,
      lng: 151.2093,
      label: "Sydney, Australia",
      value: "300+ Donations",
    },
    {
      lat: 35.6895,
      lng: 139.6917,
      label: "Tokyo, Japan",
      value: "400+ Donations",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 h-screen overflow-hidden">
        {/* Animated blood cell background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-red-500/20"
              initial={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 80}px`,
                height: `${20 + Math.random() * 80}px`,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700/90 to-red-800/90" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="relative">
                Every Drop Counts
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -right-6 -top-4 text-red-300"
                >
                  <FiDroplet className="text-5xl" />
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-red-100 mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Join our movement to save lives through blood donation. Your
              single donation can help up to 3 people.
            </motion.p>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="bg-white text-red-600 font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3">
                <FiHeart className="text-xl animate-pulse" />
                Become a Donor Today
              </button>
            </motion.div>
          </motion.div>

          {/* Scrolling indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            <FiDroplet className="text-2xl text-white/80" />
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4 bg-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiDroplet className="text-2xl text-red-600" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Who We Are
                </h2>
              </div>

              <p className="text-xl text-gray-700 leading-relaxed">
                At <span className="font-semibold text-red-600">BloodHero</span>
                , we've revolutionized blood donation through our digital
                platform that connects donors with recipients in real-time.
              </p>

              <div className="bg-gradient-to-r from-red-100 to-red-200 p-8 rounded-2xl border border-red-200 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500/10 rounded-full" />
                <p className="text-lg italic text-red-800 relative z-10">
                  "No one should suffer due to lack of available blood."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FiHeart className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Sarah Thompson</p>
                    <p className="text-sm text-red-600">Founder & CEO</p>
                  </div>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-4 mt-8">
                {[
                  "24/7 Support",
                  "Verified Donors",
                  "Global Network",
                  "Free Service",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <FiCheckCircle className="text-red-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Visual Section */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateZ: 2 }}
              whileInView={{ opacity: 1, x: 0, rotateZ: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
              className="relative h-[500px] bg-gradient-to-br from-red-100 to-red-200 rounded-[2.5rem] overflow-hidden shadow-xl"
            >
              {/* Grid pattern background */}
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

              {/* Animated blood cells */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`blood-cell-${i}`}
                    className="absolute w-8 h-8 bg-red-100 rounded-full"
                    initial={{
                      scale: 0,
                      x: `${Math.random() * 100 - 50}%`,
                      y: `${Math.random() * 100 - 50}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.8, 0],
                      x: `${(Math.random() - 0.5) * 50}%`,
                      y: `${(Math.random() - 0.5) * 50}%`,
                    }}
                    transition={{
                      duration: 5 + Math.random() * 5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Main illustration with optimized animation */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                whileHover={{ scale: 1.03 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                }}
              >
                <img
                  src="/donation-illustration.png"
                  alt="Blood donation community"
                  className="w-full h-full object-contain object-bottom"
                  loading="lazy"
                />
              </motion.div>

              {/* Floating stats with smoother animation */}
              <motion.div
                className="absolute top-8 left-8 bg-white p-4 rounded-2xl shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-2xl font-bold text-red-600">50K+</p>
                <p className="text-sm text-gray-600">Daily Active Users</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-b from-red-100 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            title="Our Impact"
            subtitle="Numbers That Matter"
            icon={<FiHeart className="text-red-600" />}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="bg-red-100 p-8 rounded-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <div className="text-red-600 text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-700">
                Create a seamless blood donation ecosystem connecting donors and
                recipients instantly.
              </p>
            </motion.div>

            <motion.div
              className="bg-red-100 p-8 rounded-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <div className="text-red-600 text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-700">
                Global network ensuring no life is lost due to blood shortage.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            title="Why Choose Us"
            subtitle="Your Trust, Our Commitment"
            icon={<FiCheckCircle className="text-red-600" />}
          />
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-red-600 text-2xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Network */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            title="Trusted By"
            subtitle="Our Valued Partners"
            icon={<FiUsers className="text-red-600" />}
          />
          <PartnerLogoCloud logos={companyLogos} />
        </div>
      </section>

      {/* Mission Timeline */}
      <section className="py-20 relative px-4 bg-red-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Our Journey"
            subtitle="Milestones that define us"
            icon={<FiHeart className="text-red-600" />}
          />
          <div className="relative mt-12">
            <div className="timeline">
              {timelineItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="timeline-marker bg-red-600" />
                  <div className="timeline-content">
                    <h3 className="text-xl font-bold">{item.year}</h3>
                    <h4 className="text-lg font-semibold text-red-600">
                      {item.title}
                    </h4>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Global Impact"
            subtitle="Connecting the world through donations"
            icon={<FiGlobe className="text-red-600" />}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Globe Visualization */}
            <div className="h-[400px] w-full rounded-xl bg-gradient-to-br from-red-50 to-white shadow-lg border border-red-100">
              <InteractiveGlobe data={globeData} />
            </div>

            {/* Statistics Panel */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-800">
                Our Worldwide Reach
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {globalStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-6 bg-white rounded-lg shadow-md border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${stat.color} bg-opacity-20`}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-gray-600">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6">
                <h4 className="font-semibold text-gray-700 mb-4">
                  Top Contributing Countries
                </h4>
                <div className="space-y-3">
                  {topCountries.map((country, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-8 text-gray-500">{index + 1}.</span>
                      <span className="flex-1 font-medium">{country.name}</span>
                      <span className="text-red-600 font-semibold">
                        {country.donations.toLocaleString()}+
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-28 bg-gradient-to-b from-red-50 to-white overflow-hidden">
        <div className="max-w-8xl mx-auto px-5 sm:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-20 lg:mb-28 text-center"
          >
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-100 text-red-600 mb-6">
              <FiHeart className="w-6 h-6" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real <span className="text-red-600">Stories</span>, Real Impact
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Hear what our community members say about their experiences
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-red-100/30 hidden lg:block pointer-events-none" />
            <div className="relative px-2 sm:px-6 lg:px-12">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 lg:mt-32"
          >
            <div className="text-center">
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-sm uppercase tracking-widest text-gray-500 mb-8"
              >
                Trusted by hospitals and organizations worldwide
              </motion.p>

              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
                {companyLogos.map((logo, index) => (
                  <motion.a
                    key={index}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0.7, scale: 0.95, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 10,
                      delay: 0.1 * index,
                    }}
                    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                    className="h-10 md:h-12 transition-opacity hover:opacity-100"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-full w-auto object-contain max-w-[150px] md:max-w-[180px]"
                      loading="lazy"
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8">
            Join our mission to save lives and create a global impact.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
              <FiDroplet className="text-xl" />
              Become a Donor
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FiDroplet className="text-red-300 mr-2" /> BloodHero
            </h3>
            <p className="text-red-200">
              Connecting donors with those in need since 2023
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-red-200">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Donate Blood
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Request Blood
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Eligibility
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-red-200">
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
                className="text-red-200 hover:text-white transition-colors"
              >
                <FiFacebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-red-200 hover:text-white transition-colors"
              >
                <FiTwitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-red-200 hover:text-white transition-colors"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-red-800">
          <p className="text-red-300">
            &copy; {new Date().getFullYear()} BloodHero. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
