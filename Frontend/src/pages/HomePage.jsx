import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Users,
  Building2,
  Shield,
  ArrowRight,
  Zap,
  Globe,
  Droplet,
  Activity,
  PhoneCall,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken, removeToken, getUserRole } from '../utils/storage';
import { userLogout, hospitalLogout, ngoLogout } from '../services/authService.js';

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [animatedStats, setAnimatedStats] = useState({
    lives: 0,
    donors: 0,
    hospitals: 0,
  });
  const missionRef = useRef(null);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  useEffect(() => {
    const maxValues = { lives: 15420, donors: 5280, hospitals: 1200 };
    const increments = { lives: 123, donors: 42, hospitals: 8 };
    let current = { lives: 0, donors: 0, hospitals: 0 };

    const interval = setInterval(() => {
      const updated = {
        lives: Math.min(current.lives + increments.lives, maxValues.lives),
        donors: Math.min(current.donors + increments.donors, maxValues.donors),
        hospitals: Math.min(current.hospitals + increments.hospitals, maxValues.hospitals),
      };
      setAnimatedStats(updated);
      current = updated;
      if (
        current.lives === maxValues.lives &&
        current.donors === maxValues.donors &&
        current.hospitals === maxValues.hospitals
      )
        clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleDashboard = () => navigate('/dashboard');

  // Enhanced role-based logout logic
  const handleLogout = async () => {
    try {
      const role = getUserRole();

      switch (role) {
        case 'hospital':
          await hospitalLogout();
          break;
        case 'ngo':
          await ngoLogout();
          break;
        case 'user':
        default:
          await userLogout();
      }

      removeToken();
      setIsLoggedIn(false);

      showToast('You have been logged out successfully');

      // Redirect to homepage after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };

  // Button component with animations
  const Button = ({ children, primary, onClick, className = '' }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
        primary
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700'
          : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
      } ${className}`}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="text-gray-800 overflow-x-hidden">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-6 py-4 rounded-md shadow-lg text-white z-50 ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-red-200 opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 20}px`,
                height: `${Math.random() * 100 + 20}px`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: Math.random() * 4 + 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-red-600 to-pink-600 text-transparent bg-clip-text">
              Connecting Blood Donors
            </span>
            <br />
            to Save Lives
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-2xl text-gray-700 mb-10"
          >
            LifeLink bridges the gap between donors, hospitals, and NGOs—ensuring the right blood
            reaches the right person at the right time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {isLoggedIn ? (
              <>
                <Button primary onClick={handleDashboard}>
                  Go to Dashboard
                </Button>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button primary onClick={handleRegister}>
                  Join Now
                </Button>
                <Button onClick={handleLogin}>Login</Button>
              </>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 animate-bounce"
            onClick={() => missionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ArrowRight className="h-8 w-8 text-red-600 rotate-90 mx-auto" />
          </motion.button>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-20 bg-gradient-to-br from-white to-red-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-red-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-200 rounded-full opacity-50"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                  <Heart className="h-12 w-12 text-red-600 mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    We're on a mission to eliminate preventable deaths due to blood shortages. Every
                    2 seconds someone needs blood, and LifeLink ensures donors are always available
                    when emergencies strike.
                  </p>
                  <div className="flex items-center text-red-600 font-medium">
                    <span>Join the movement</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                {
                  icon: Activity,
                  title: 'Real-time Matching',
                  desc: 'AI-powered donor matching for urgent needs',
                },
                {
                  icon: PhoneCall,
                  title: 'Instant Alerts',
                  desc: 'Get notified when your blood type is needed',
                },
                {
                  icon: Users,
                  title: 'Community Network',
                  desc: 'Connect with local donors and organizations',
                },
                {
                  icon: Droplet,
                  title: 'Save Lives',
                  desc: '1 donation can save up to 3 lives',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-md border border-red-50 hover:border-red-200 transition-all"
                >
                  <item.icon className="h-8 w-8 text-red-600 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4"
            >
              How LifeLink Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-lg text-gray-600"
            >
              A seamless process connecting those who need blood with those willing to donate
            </motion.p>
          </div>

          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-red-200 hidden md:block"></div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: Heart,
                  title: '1. Register as Donor',
                  desc: 'Create your donor profile with blood type and availability',
                  delay: 0,
                },
                {
                  icon: Building2,
                  title: '2. Hospital Requests',
                  desc: 'Hospitals post urgent blood needs in real-time',
                  delay: 0.2,
                },
                {
                  icon: Shield,
                  title: '3. Match & Donate',
                  desc: 'Get matched to nearby requests and save lives',
                  delay: 0.4,
                },
              ].map(({ icon: Icon, title, desc, delay }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl shadow-lg p-8 border-t-4 border-red-600 text-center"
                >
                  <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Icon className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4"
            >
              Making a Real Difference
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-lg text-red-100"
            >
              Join thousands making an impact in their communities
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { Icon: Zap, label: 'Lives Saved', value: animatedStats.lives },
              { Icon: Users, label: 'Active Donors', value: animatedStats.donors },
              { Icon: Globe, label: 'Partner Hospitals', value: animatedStats.hospitals },
            ].map(({ Icon, label, value }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20"
              >
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full mb-6 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">
                  {value.toLocaleString()}
                  <span className="text-red-300">+</span>
                </div>
                <div className="text-xl">{label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1 mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-3">Become a LifeSaver Today</h3>
                <p className="text-red-100">
                  Register now and join our community of heroes who give the gift of life
                </p>
              </div>
              <div>
                <Button primary onClick={isLoggedIn ? handleDashboard : handleRegister}>
                  {isLoggedIn ? 'Find Donation Requests' : 'Join Now'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4"
            >
              Stories of Hope
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-lg text-gray-600"
            >
              Real people whose lives were changed through donation
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'Emergency Physician, City Hospital',
                content:
                  'LifeLink cut our blood request response time from hours to minutes. Last month, we saved a trauma patient because a donor was just 3 blocks away when we sent the alert.',
                delay: 0,
              },
              {
                name: 'Michael Thompson',
                role: 'Regular Donor',
                content:
                  "I've donated 8 times through LifeLink. The app makes it so easy - I get notifications when my blood type is needed nearby. Knowing I've helped save lives is incredibly rewarding.",
                delay: 0.2,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: testimonial.delay }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-8 border border-red-100"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div className="ml-4">
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-red-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-red-600 to-pink-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Make a Difference?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl max-w-2xl mx-auto text-red-100 mb-10"
          >
            Every donation counts. Join our lifesaving community today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Button primary onClick={isLoggedIn ? handleDashboard : handleRegister}>
              {isLoggedIn ? 'Find Donation Opportunities' : "Join Now - It's Free"}
            </Button>
            <Button onClick={handleLogin}>
              {isLoggedIn ? 'Account Settings' : 'Login to Dashboard'}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LifeLink</h3>
              <p className="text-gray-400 mb-4">
                Connecting blood donors with those in need since 2023.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map(platform => (
                  <a key={platform} href="#" className="text-gray-400 hover:text-white transition">
                    <span className="sr-only">{platform}</span>
                    <div className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                      {platform.charAt(0).toUpperCase()}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Quick Links',
                links: ['About Us', 'How It Works', 'Success Stories', 'FAQs'],
              },
              {
                title: 'Resources',
                links: ['Donor Guide', 'Hospital Resources', 'NGO Toolkit', 'Research'],
              },
              {
                title: 'Contact',
                links: [
                  'support@lifelink.com',
                  '+1 (800) LIFELINK',
                  'Emergency Contact',
                  'Partnerships',
                ],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} LifeLink. All rights reserved.</p>
            <p className="mt-2">Bridging lives with technology. Powered by compassion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
