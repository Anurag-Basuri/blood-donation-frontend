import React, { useState, useEffect } from 'react';
import { Heart, Users, Building2, Shield, ArrowRight, Menu, X, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken } from '../utils/storage';
import { userLogout, hospitalLogin, ngoLogout } from '../services/authService.js';

const Homepage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    lives: 0,
    donors: 0,
    hospitals: 0,
  });

  // Check login status
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  // Animate stats
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
      ) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleDashboard = () => navigate('/dashboard');
  const handleLogout = () => {
    removeToken();
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-red-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-red-300 rounded-full opacity-25 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-red-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-500 animate-pulse" fill="currentColor" />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              LifeLink
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-red-600 font-medium">
              Home
            </a>
            <a href="#about" className="text-gray-700 hover:text-red-600 font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-red-600 font-medium">
              Contact
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleDashboard}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={handleLogout} className="btn-outline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Login
                </button>
                <button onClick={handleRegister} className="btn-primary">
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-red-50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 px-4 py-4 border-t border-red-100 space-y-2">
            <a href="#home" className="block text-gray-700 hover:text-red-600">
              Home
            </a>
            <a href="#about" className="block text-gray-700 hover:text-red-600">
              About
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-red-600">
              Contact
            </a>
            {isLoggedIn ? (
              <>
                <button onClick={handleDashboard} className="btn-primary w-full">
                  Dashboard
                </button>
                <button onClick={handleLogout} className="btn-outline w-full">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLogin} className="btn-outline w-full">
                  Login
                </button>
                <button onClick={handleRegister} className="btn-primary w-full">
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center text-center px-4">
        <div className="space-y-8">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-red-600 animate-pulse">
              Connecting Hearts,
            </span>
            <br />
            <span className="text-gray-800">Saving Lives</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Join the lifeline connecting blood donors, hospitals, and NGOs in a compassionate
            ecosystem.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <button onClick={handleDashboard} className="btn-primary-lg">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={handleRegister} className="btn-primary-lg">
                  Join as Donor
                </button>
                <button onClick={handleLogin} className="btn-outline-lg">
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Serve</h2>
          <p className="text-xl text-gray-600 mb-12">Three pillars of our lifesaving ecosystem</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: Users,
                title: 'Blood Donors',
                desc: 'Heroes who give the gift of life.',
              },
              {
                Icon: Building2,
                title: 'Hospitals',
                desc: 'Connect and request needed blood quickly.',
              },
              {
                Icon: Shield,
                title: 'NGOs',
                desc: 'Manage drives and community outreach.',
              },
            ].map(({ Icon, title, desc }, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
          <p className="text-xl text-red-100 mb-12">Making a difference, one donation at a time</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: Zap, label: 'Lives Saved', value: animatedStats.lives },
              { Icon: Heart, label: 'Active Donors', value: animatedStats.donors },
              {
                Icon: Globe,
                label: 'Partner Hospitals',
                value: animatedStats.hospitals,
              },
            ].map(({ Icon, label, value }, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full mb-4 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{value.toLocaleString()}+</div>
                <div className="text-lg">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-red-500" fill="currentColor" />
              <span className="text-2xl font-bold">LifeLink</span>
            </div>
            <p className="text-gray-400">Connecting hearts and saving lives through technology.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Find Donors
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: help@lifelink.com</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 text-sm">
          © {new Date().getFullYear()} LifeLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
