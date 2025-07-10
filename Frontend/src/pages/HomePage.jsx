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
  MapPin,
  Clock,
  Star,
  Award,
  ChevronRight,
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

  return (
    <div className="text-gray-800 overflow-x-hidden bg-gradient-to-b from-red-50 via-white to-pink-50 min-h-screen">
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

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 overflow-hidden">
        {/* Animated Particle Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-700/60 via-pink-700/40 to-red-900/70"></div>
          
          {/* Floating Particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 50, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 8 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
          
          {/* Floating Hearts */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                zIndex: 1,
              }}
              initial={{ y: 0, opacity: 0.15 + Math.random() * 0.15 }}
              animate={{
                y: [0, -40 - Math.random() * 30, 0],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                duration: 7 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Heart className="w-8 h-8 text-white/40" />
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] w-full">
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-2xl"
            style={{ textShadow: '0 4px 32px #be123c88' }}
          >
            <span className="bg-gradient-to-r from-pink-200 via-white to-pink-300 bg-clip-text text-transparent">
              Give Blood,
            </span>{' '}
            <span className="text-pink-200">Save Lives</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-2xl md:text-3xl text-pink-100 font-semibold mb-2 tracking-wide"
          >
            Every <span className="font-bold text-white">2 Seconds</span>, Someone Needs Blood
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8"
          >
            Be the hope. Join LifeLink and become the lifeline for someone in need. Your donation
            can be the difference between hope and heartbreak.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <motion.button
              whileHover={{
                scale: 1.09,
                boxShadow: '0 8px 32px 0 #be123c99',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRegister}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-red-600 via-pink-600 to-red-700 text-white font-bold text-lg shadow-xl shadow-red-500/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-400/50"
              type="button"
            >
              Donate Now
            </motion.button>
            
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: '#fff',
                color: '#be123c',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => missionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-full border-2 border-white text-white font-semibold text-lg bg-white/10 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
              type="button"
            >
              Learn More
            </motion.button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white/90 text-base backdrop-blur-sm shadow-lg"
          >
            <Heart className="w-5 h-5 text-pink-200 animate-pulse" />
            <span>1 donation can save up to 3 lives</span>
          </motion.div>
        </div>
        
        {/* Animated Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-8 h-14 rounded-full border-2 border-white/50 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="w-2 h-2 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
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
                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-6 -left-6 w-32 h-32 bg-red-200 rounded-full opacity-20"
                ></motion.div>
                
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-200 rounded-full opacity-20"></div>
                
                <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-red-100 overflow-hidden">
                  {/* Floating Dot Pattern */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-red-100/30 blur-xl"></div>
                  
                  <Heart className="h-12 w-12 text-red-600 mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    We're on a mission to eliminate preventable deaths due to blood shortages. Every
                    2 seconds someone needs blood, and LifeLink ensures donors are always available
                    when emergencies strike.
                  </p>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {[
                      { icon: MapPin, text: '500+ locations' },
                      { icon: Clock, text: '24/7 availability' },
                      { icon: Star, text: '98% success rate' },
                      { icon: Award, text: 'Trusted by hospitals' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-red-600">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.text}</span>
                      </div>
                    ))}
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
                <motion.div
                  key={i}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -10px rgba(190, 18, 60, 0.2)' }}
                  className="bg-white rounded-xl p-6 shadow-md border border-red-50 hover:border-red-200 transition-all"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-red-50 to-white relative">
        {/* Decorative Wave */}
        <div className="absolute top-0 left-0 w-full h-24 -translate-y-24 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity="0.25" 
              className="fill-red-100"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity="0.5" 
              className="fill-red-100"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-red-50"
            ></path>
          </svg>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
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
            {/* Animated Timeline */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-red-500 to-pink-500 hidden md:block">
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-full bg-red-500"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: Heart,
                  title: '1. Register as Donor',
                  desc: 'Create your donor profile with blood type and availability',
                  delay: 0,
                  color: 'from-red-500 to-pink-500',
                },
                {
                  icon: Building2,
                  title: '2. Hospital Requests',
                  desc: 'Hospitals post urgent blood needs in real-time',
                  delay: 0.2,
                  color: 'from-pink-500 to-purple-500',
                },
                {
                  icon: Shield,
                  title: '3. Match & Donate',
                  desc: 'Get matched to nearby requests and save lives',
                  delay: 0.4,
                  color: 'from-purple-500 to-indigo-500',
                },
              ].map(({ icon: Icon, title, desc, delay, color }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-600 text-center group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl z-0"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                      <Icon className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{title}</h3>
                    <p className="text-gray-600">{desc}</p>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white relative overflow-hidden">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
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
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 group"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-white/20 to-white/30 rounded-full mb-6 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">
                  {value.toLocaleString()}
                  <span className="text-red-300">+</span>
                </div>
                <div className="text-xl">{label}</div>
                
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '80%' }}
                  transition={{ duration: 2, delay: 0.3 }}
                  className="h-1 bg-gradient-to-r from-red-300 to-pink-300 mx-auto mt-4 rounded-full"
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-white/10 to-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1 mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-3">Become a LifeSaver Today</h3>
                <p className="text-red-100">
                  Register now and join our community of heroes who give the gift of life
                </p>
              </div>
              <div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 #ffffff33' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isLoggedIn ? handleDashboard : handleRegister}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-white to-pink-100 text-red-600 font-bold shadow-lg transition-all duration-300"
                >
                  {isLoggedIn ? 'Find Donation Requests' : 'Join Now'}
                  <ChevronRight className="inline ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -right-1/4 w-full h-full bg-red-50 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
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
                className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-8 border border-red-100 relative overflow-hidden"
              >
                {/* Decorative Quote */}
                <div className="absolute -top-10 -right-5 text-red-100/10 text-9xl font-serif">"</div>
                
                <div className="flex items-start mb-4">
                  <div className="bg-gradient-to-br from-red-100 to-pink-100 border-2 border-white rounded-xl w-16 h-16 shadow-sm"></div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-red-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic relative z-10">"{testimonial.content}"</p>
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
      <section className="py-24 bg-gradient-to-br from-red-600 to-pink-700 text-white relative overflow-hidden">
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
              opacity: [0.05, 0.2, 0.05],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
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
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 #ffffff33' }}
              whileTap={{ scale: 0.95 }}
              onClick={isLoggedIn ? handleDashboard : handleRegister}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-white to-pink-100 text-red-600 font-bold shadow-lg transition-all duration-300"
            >
              {isLoggedIn ? 'Find Donation Opportunities' : "Join Now - It's Free"}
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: '#fff',
                color: '#be123c',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="px-8 py-4 rounded-full border-2 border-white text-white font-semibold bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {isLoggedIn ? 'Account Settings' : 'Login to Dashboard'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LifeLink</h3>
              <p className="text-gray-400 mb-4">
                Connecting blood donors with those in need since 2023.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map(platform => (
                  <motion.a
                    key={platform}
                    whileHover={{ y: -5 }}
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <span className="sr-only">{platform}</span>
                    <div className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      {platform.charAt(0).toUpperCase()}
                    </div>
                  </motion.a>
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
                      <motion.a 
                        whileHover={{ x: 5 }} 
                        href="#" 
                        className="text-gray-400 hover:text-white transition flex items-center gap-2"
                      >
                        <ChevronRight className="h-4 w-4 text-red-500" />
                        {link}
                      </motion.a>
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