import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically load heavy components
const InteractiveGlobe = dynamic(
  () => import("../components/InteractiveGlobe"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-800/50 animate-pulse rounded-xl" />
    ),
  }
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-white animate-bounce"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// Define timeline items
const timelineItems = [
  {
    year: "2000",
    description: "The journey begins with our first blood drive.",
  },
  { year: "2005", description: "Expanded to 10 cities across the country." },
  { year: "2010", description: "Reached 1 million blood donations milestone." },
  {
    year: "2020",
    description: "Launched the global blood donation initiative.",
  },
];

// Define stories
const stories = [
  {
    image: "/images/story1.jpg",
    title: "A Life Saved",
    description: "John's life was saved thanks to a blood donor.",
  },
  {
    image: "/images/story2.jpg",
    title: "A Community Effort",
    description: "Our blood drive brought the community together.",
  },
  {
    image: "/images/story3.jpg",
    title: "A Hero's Journey",
    description: "Sarah became a regular donor and a true hero.",
  },
];

const About = () => {
  const { scrollYProgress } = useScroll();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeStory, setActiveStory] = useState(0);

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </motion.video>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Every Drop Tells a Story
            </span>
          </h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="glowing-btn px-12 py-4 text-xl font-semibold"
          >
            <span className="glowing-text">Be the Change</span>
          </motion.button>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8"
        >
          <ChevronDownIcon className="h-12 w-12 text-white animate-bounce" />
        </motion.div>
      </section>

      {/* Mission Timeline */}
      <section className="py-20 relative">
        {timelineItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mission-step"
          >
            <div className="glowing-dot" />
            <h3 className="text-3xl font-bold">{item.year}</h3>
            <p className="text-lg">{item.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Interactive Globe */}
      <section className="py-20 px-4">
        <InteractiveGlobe />
      </section>

      {/* Stories Carousel */}
      <div className="relative h-[600px] overflow-hidden">
        {stories.map((story, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 bg-cover bg-center ${
              index === activeStory ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${story.image})` }}
            animate={{ opacity: index === activeStory ? 1 : 0 }}
            transition={{ duration: 1 }}
          >
            <div className="story-overlay">
              <h4 className="text-4xl font-bold">{story.title}</h4>
              <p>{story.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
        <motion.div
          whileHover={{ rotateY: 10, scale: 1.05 }}
          className="action-card glass-card"
        >
          <h3>Become a Donor</h3>
        </motion.div>
        {/* Add other action cards */}
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-8 right-8 glass-toggle"
      >
        {isDarkMode ? "🌞" : "🌙"}
      </button>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .glowing-btn {
    background: linear-gradient(45deg, #ff0000, #ff6666);
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    border-radius: 50px;
    transition: all 0.3s ease;
  }

  .glowing-text {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .mission-step::before {
    content: '';
    position: absolute;
    width: 3px;
    background: linear-gradient(to bottom, #ff0000, transparent);
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }
`;

export default About;
