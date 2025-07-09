import React, { useState, useEffect } from 'react';
import { Heart, Users, Building2, Shield, ArrowRight, Menu, X, Zap, Globe, Award } from 'lucide-react';

const Homepage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    lives: 0,
    donors: 0,
    hospitals: 0
  });

  // Check if user is logged in (simulated with localStorage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Animate stats on component mount
  useEffect(() => {
    const animateStats = () => {
      let currentLives = 0;
      let currentDonors = 0;
      let currentHospitals = 0;
      
      const interval = setInterval(() => {
        if (currentLives < 15420) currentLives += 123;
        if (currentDonors < 5280) currentDonors += 42;
        if (currentHospitals < 1200) currentHospitals += 8;
        
        setAnimatedStats({
          lives: Math.min(currentLives, 15420),
          donors: Math.min(currentDonors, 5280),
          hospitals: Math.min(currentHospitals, 1200)
        });
        
        if (currentLives >= 15420 && currentDonors >= 5280 && currentHospitals >= 1200) {
          clearInterval(interval);
        }
      }, 30);
    };
    
    setTimeout(animateStats, 500);
  }, []);

  const handleLogin = () => {
    // Simulate login
    localStorage.setItem('lifelink_token', 'mock-token-123');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lifelink_token');
    setIsLoggedIn(false);
  };

  const handleDashboard = () => {
    alert('Redirecting to dashboard...');
  };

  const handleRegister = () => {
    alert('Redirecting to registration...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-gradient-to-br from-red-300 to-pink-300 rounded-full opacity-25 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-red-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Heart className="h-8 w-8 text-red-500 animate-pulse" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-400 to-pink-400 rounded-full animate-bounce"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                LifeLink
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">About</a>
              <a href="#" className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium">Contact</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="px-6 py-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-red-100 py-4">
            <div className="px-4 space-y-3">
              <a href="#" className="block text-gray-700 hover:text-red-600 transition-colors duration-200">Home</a>
              <a href="#" className="block text-gray-700 hover:text-red-600 transition-colors duration-200">About</a>
              <a href="#" className="block text-gray-700 hover:text-red-600 transition-colors duration-200">Contact</a>
              <div className="pt-3 border-t border-red-100">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleDashboard}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleLogin}
                      className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-full"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleRegister}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-pulse">
                  Connecting Hearts,
                </span>
                <br />
                <span className="text-gray-800">Saving Lives</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
                Join the lifeline that connects blood donors, hospitals, and NGOs in a seamless ecosystem of care and compassion.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleDashboard}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRegister}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Join as Donor
                  </button>
                  <button
                    onClick={handleLogin}
                    className="px-8 py-4 border-2 border-red-300 text-red-600 text-lg font-semibold rounded-full hover:bg-red-50 transition-all duration-300 transform hover:scale-105"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Hero Animation */}
            <div className="relative mt-16">
              <div className="flex justify-center items-center space-x-8">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-pink-400 border-2 border-white animate-pulse delay-${i * 100}`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="text-sm">Connected Community</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Serve</h2>
            <p className="text-xl text-gray-600">Three pillars of our lifesaving ecosystem</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Donors */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Blood Donors</h3>
              <p className="text-gray-600 text-center">
                Heroes who give the gift of life. Register, find nearby drives, and track your donation history with ease.
              </p>
            </div>

            {/* Hospitals */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Hospitals</h3>
              <p className="text-gray-600 text-center">
                Healthcare facilities that need blood. Manage inventory, request specific types, and connect with donors instantly.
              </p>
            </div>

            {/* NGOs */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">NGOs</h3>
              <p className="text-gray-600 text-center">
                Organizations driving community impact. Organize drives, manage campaigns, and expand your reach efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-red-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-red-100">Making a difference, one donation at a time</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 mx-auto">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{animatedStats.lives.toLocaleString()}+</div>
              <div className="text-red-100 text-lg">Lives Saved</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 mx-auto">
                <Heart className="h-10 w-10 text-white" fill="currentColor" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{animatedStats.donors.toLocaleString()}+</div>
              <div className="text-red-100 text-lg">Active Donors</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 mx-auto">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{animatedStats.hospitals.toLocaleString()}+</div>
              <div className="text-red-100 text-lg">Partner Hospitals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-red-500" fill="currentColor" />
                <span className="text-2xl font-bold">LifeLink</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting hearts and saving lives through technology. Join our mission to make blood donation accessible and efficient for everyone.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Find Donors</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Emergency</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: help@lifelink.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Emergency: +1 (555) 911-LIFE</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 LifeLink. All rights reserved. Saving lives, one connection at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;