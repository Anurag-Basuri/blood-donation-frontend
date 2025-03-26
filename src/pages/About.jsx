import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import {
  FiDroplet,
  FiHeart,
  FiUsers,
  FiCheckCircle,
  FiGlobe,
  FiChevronLeft,
  FiChevronRight,
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
      <div className="w-full h-96 bg-gradient-to-r from-red-500/10 to-pink-500/10 animate-pulse rounded-2xl" />
    ),
  }
);

const About = () => {
  const { scrollYProgress } = useScroll();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const stats = [
    { value: "100K+", label: "Lives Saved", icon: <FiHeart /> },
    { value: "50K+", label: "Active Donors", icon: <FiUsers /> },
    { value: "1.5K+", label: "Blood Drives", icon: <FiDroplet /> },
    { value: "100+", label: "Cities Covered", icon: <FiGlobe /> },
  ];

  const features = [
    {
      title: "Fast Matching",
      icon: <FiCheckCircle />,
      description: "Instant donor-recipient connection system",
    },
    {
      title: "Verified Network",
      icon: <FiCheckCircle />,
      description: "Rigorous verification for safety and trust",
    },
    {
      title: "24/7 Availability",
      icon: <FiCheckCircle />,
      description: "Emergency support anytime, anywhere",
    },
    {
      title: "Free Service",
      icon: <FiCheckCircle />,
      description: "Community-driven, zero-cost platform",
    },
  ];

  const timelineItems = [
    {
      year: "2000",
      description: "The journey begins with our first blood drive.",
    },
    { year: "2005", description: "Expanded to 10 cities across the country." },
    {
      year: "2010",
      description: "Reached 1 million blood donations milestone.",
    },
    {
      year: "2020",
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
    {
      quote:
        "This platform made finding a donor quick and easy during my emergency.",
      author: "Michael Chen",
      role: "Recipient",
      avatar: "/avatars/michael.jpg",
    },
    {
      quote: "Being a donor has given me a sense of purpose and fulfillment.",
      author: "Emily Davis",
      role: "Volunteer",
      avatar: "/avatars/emily.jpg",
    },
  ];

  const companyLogos = [
    { src: "/logos/logo1.png", alt: "Company 1" },
    { src: "/logos/logo2.png", alt: "Company 2" },
    { src: "/logos/logo3.png", alt: "Company 3" },
    { src: "/logos/logo4.png", alt: "Company 4" },
    { src: "/logos/logo5.png", alt: "Company 5" },
  ];

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
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/70 to-pink-600/70" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Main headline with animated drop */}
            <div className="relative inline-block">
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
            </div>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Join our movement to save lives through blood donation. Your
              single donation can help up to 3 people.
            </motion.p>

            {/* Animated CTA button */}
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
      <section className="py-20 px-4 bg-white/50">
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Who We Are
                </h2>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed">
                At{" "}
                <span className="font-semibold text-red-600">LifeStream</span>,
                we've revolutionized blood donation through our digital-first
                platform that connects donors with recipients in real-time. Born
                from a personal emergency, we're now a global movement.
              </p>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border border-red-100 relative overflow-hidden">
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
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <FiCheckCircle className="text-red-500" />
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
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] bg-gradient-to-br from-red-50 to-pink-50 rounded-[2.5rem] overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

              {/* Animated blood cells */}
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-8 bg-red-100 rounded-full"
                    initial={{
                      scale: 0,
                      x: Math.random() * 100 - 50 + "%",
                      y: Math.random() * 100 - 50 + "%",
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Main illustration with parallax effect */}
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/3d-donation-scene.png"
                  alt="Our community"
                  className="w-full h-full object-contain object-bottom"
                />
              </motion.div>

              {/* Floating stats */}
              <div className="absolute top-8 left-8 bg-white p-4 rounded-2xl shadow-lg">
                <p className="text-2xl font-bold text-red-600">50K+</p>
                <p className="text-sm text-gray-600">Daily Active Users</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-b from-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            title="Our Impact"
            subtitle="Numbers That Matter"
            icon={<FiHeart />}
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
              className="bg-red-50 p-8 rounded-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <div className="text-red-600 text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600">
                Create a seamless blood donation ecosystem connecting donors and
                recipients instantly.
              </p>
            </motion.div>

            <motion.div
              className="bg-pink-50 p-8 rounded-2xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <div className="text-pink-600 text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-600">
                Global network ensuring no life is lost due to blood shortage.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            title="Why Choose Us"
            subtitle="Your Trust, Our Commitment"
          />
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-red-500 text-2xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Network */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading title="Trusted By" subtitle="Our Valued Partners" />
          <PartnerLogoCloud />
        </div>
      </section>

      {/* Mission Timeline */}
      <section className="py-20 relative px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Our Journey"
            subtitle="Milestones that define us"
            icon={<FiHeart />}
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
                  <div className="timeline-marker bg-red-500" />
                  <div className="timeline-content">
                    <h3 className="text-xl font-bold">{item.year}</h3>
                    <h4 className="text-lg font-semibold text-red-500">
                      {item.title}
                    </h4>
                    <p className="text-gray-600">{item.description}</p>
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
            icon={<FiUsers />}
          />
          <InteractiveGlobe />
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-indigo-100 to-purple-100 transform -skew-y-2 origin-top-left pointer-events-none"
        />

        <div className="max-w-8xl mx-auto px-5 sm:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-20 lg:mb-28 text-center"
          >
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-50 text-indigo-500 mb-6">
              <FiHeart className="w-6 h-6" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real <span className="text-indigo-600">Stories</span>, Real Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear what our community members say about their experiences
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-indigo-50/30 hidden lg:block pointer-events-none" />
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
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-8">
                Trusted by innovative teams worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                {companyLogos.map((logo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.7, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    viewport={{ once: true }}
                    className="h-8 md:h-10 grayscale hover:grayscale-0 transition-all"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-full w-auto object-contain max-w-[120px]"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-r from-blue-100 to-indigo-100 transform skew-y-2 origin-bottom-left pointer-events-none"
        />
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-pink-500 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8">
            Join our mission to save lives and create a global impact.
          </p>
          <div className="flex justify-center gap-4">
            <GradientButton
              text="Become a Donor"
              icon={<FiDroplet />}
              className="px-12 py-4 text-xl"
              glow
            />
            <GradientButton
              text="Volunteer With Us"
              icon={<FiUsers />}
              className="px-12 py-4 text-xl"
            />
          </div>
        </div>
      </section>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed bottom-8 right-8 p-4 rounded-full backdrop-blur-lg border transition-all ${
          isDarkMode
            ? "bg-white/5 border-white/10 hover:bg-white/10"
            : "bg-black/5 border-black/10 hover:bg-black/10"
        }`}
      >
        {isDarkMode ? (
          <FiHeart className="text-2xl text-yellow-400" />
        ) : (
          <FiDroplet className="text-2xl text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default About;
