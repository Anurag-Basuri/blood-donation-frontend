import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Users,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Droplets,
  Plus,
  Activity,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';
import { userLogin, ngoLogin, hospitalLogin } from '../../services/authService.js';

const Login = () => {
  const [userType, setUserType] = useState('user');
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const userTypes = [
    {
      id: 'user',
      label: 'Normal Users',
      icon: Heart,
      color: 'from-red-500 via-pink-500 to-rose-500',
      bg: 'bg-red-500/10',
    },
    {
      id: 'hospital',
      label: 'Hospital',
      icon: Building2,
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      bg: 'bg-blue-500/10',
    },
    {
      id: 'ngo',
      label: 'NGO',
      icon: Users,
      color: 'from-green-500 via-emerald-500 to-teal-500',
      bg: 'bg-green-500/10',
    },
  ];

  const inspirationalQuotes = [
    { text: 'Every drop counts', subtext: 'One donation can save three lives', icon: '💧' },
    { text: "Heroes don't wear capes", subtext: 'They donate blood', icon: '🦸' },
    { text: 'Be the reason someone smiles', subtext: 'Donate blood, spread hope', icon: '😊' },
    { text: 'Life is in the blood', subtext: 'Share yours generously', icon: '❤️' },
  ];

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide(prev => (prev + 1) % inspirationalQuotes.length),
      4000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (userType === 'user') {
        response = await userLogin({ email, phone, userName, password });
      } else if (userType === 'hospital') {
        response = await hospitalLogin({ email, password });
      } else if (userType === 'ngo') {
        response = await ngoLogin({ email, password });
      }

      if (response.success) {
        console.log('Login successful:', response.data);
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = userTypes.find(type => type.id === userType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full filter blur-3xl animate-pulse delay-2000"></div>

        {/* Floating Elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            {i % 3 === 0 && <Heart className="w-4 h-4 text-red-400" />}
            {i % 3 === 1 && <Droplets className="w-4 h-4 text-blue-400" />}
            {i % 3 === 2 && <Plus className="w-4 h-4 text-green-400" />}
          </div>
        ))}
      </div>

      <div className="relative z-10 h-screen flex">
        {/* Left Side - Fixed Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-lg w-full space-y-10 text-center">
            {/* Logo & Tagline */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative group mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Heart className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-spin">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent mb-2 tracking-tight drop-shadow-lg">
                LifeLink
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <p className="text-gray-200 font-medium text-lg">
                  Connecting hearts • Saving lives
                </p>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </div>

            {/* Quote Carousel */}
            <div className="relative h-36 overflow-hidden rounded-2xl bg-gradient-to-r from-white/10 to-white/20 backdrop-blur-md border border-white/20 p-8 shadow-xl">
              {inspirationalQuotes.map((quote, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${
                    index === currentSlide
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                  }`}
                >
                  <div className="text-4xl mb-2">{quote.icon}</div>
                  <h2 className="text-2xl font-bold text-white drop-shadow">{quote.text}</h2>
                  <p className="text-gray-200 text-base">{quote.subtext}</p>
                </div>
              ))}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                {inspirationalQuotes.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white w-6' : 'bg-white/30 w-2'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-5 bg-white/10 rounded-xl backdrop-blur border border-white/10 shadow">
                <div className="text-2xl font-bold text-red-400 drop-shadow">10K+</div>
                <div className="text-xs text-gray-200">Lives Saved</div>
              </div>
              <div className="text-center p-5 bg-white/10 rounded-xl backdrop-blur border border-white/10 shadow">
                <div className="text-2xl font-bold text-blue-400 drop-shadow">500+</div>
                <div className="text-xs text-gray-200">Hospitals</div>
              </div>
              <div className="text-center p-5 bg-white/10 rounded-xl backdrop-blur border border-white/10 shadow">
                <div className="text-2xl font-bold text-green-400 drop-shadow">50K+</div>
                <div className="text-xs text-gray-200">Donors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Scrollable Login Form */}
        <div className="w-full lg:w-1/2 h-screen overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center items-center space-x-3 mb-8">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
                  LifeLink
                </h1>
              </div>

              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Welcome Back</h3>
                  <p className="text-gray-300">Sign in to continue your journey</p>
                </div>

                {/* User Type Selection */}
                <div className="mb-6 space-y-3">
                  {userTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setUserType(type.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden ${
                          userType === type.id
                            ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105 border-transparent`
                            : `border-white/20 hover:border-white/40 ${type.bg} text-gray-200 hover:scale-102`
                        }`}
                      >
                        <div className="flex items-center space-x-4 relative z-10">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center ${
                              userType === type.id ? 'bg-white/20' : 'bg-white/10'
                            }`}
                          >
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-lg">{type.label}</p>
                            <p className="text-sm opacity-80">
                              {type.id === 'user'
                                ? 'Be a hero, save lives'
                                : type.id === 'hospital'
                                ? 'Connect with donors'
                                : 'Organize drives'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Login Method (User Only) */}
                {userType === 'user' && (
                  <div className="mb-6 flex space-x-2 bg-white/5 rounded-xl p-1">
                    {[
                      {
                        key: 'email',
                        icon: Mail,
                        label: 'Email',
                      },
                      {
                        key: 'phone',
                        icon: Phone,
                        label: 'Phone',
                      },
                      {
                        key: 'username',
                        icon: User,
                        label: 'Username',
                      },
                    ].map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setLoginMethod(key)}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          loginMethod === key
                            ? 'bg-white/20 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <Icon className="inline-block w-4 h-4 mr-2" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Dynamic Input Fields */}
                  {userType === 'user' && loginMethod === 'email' && (
                    <Input
                      label="Email"
                      type="email"
                      icon={Mail}
                      value={email}
                      setValue={setEmail}
                    />
                  )}
                  {userType === 'user' && loginMethod === 'phone' && (
                    <Input
                      label="Phone Number"
                      type="text"
                      icon={Phone}
                      value={phone}
                      setValue={setPhone}
                    />
                  )}
                  {userType === 'user' && loginMethod === 'username' && (
                    <Input
                      label="Username"
                      type="text"
                      icon={User}
                      value={userName}
                      setValue={setUserName}
                    />
                  )}
                  {userType !== 'user' && (
                    <Input
                      label="Email Address"
                      type="email"
                      icon={Mail}
                      value={email}
                      setValue={setEmail}
                    />
                  )}
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    value={password}
                    setValue={setPassword}
                    toggleIcon={showPassword ? EyeOff : Eye}
                    onToggle={() => setShowPassword(!showPassword)}
                  />

                  {error && (
                    <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden ${
                      isLoading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : `bg-gradient-to-r ${selectedType.color} hover:shadow-2xl hover:scale-105 active:scale-95`
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>

                  <div className="text-center text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <nav className="inline-block text-white hover:underline">
                      <Link>Sign Up</Link>
                    </nav>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Component
const Input = ({ label, type, icon: Icon, value, setValue, toggleIcon: ToggleIcon, onToggle }) => (
  <div className="relative group">
    <label className="block text-sm font-medium text-gray-200 mb-3">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors" />
      </div>
      <input
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200 hover:bg-white/15"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
      {ToggleIcon && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <ToggleIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
        </button>
      )}
    </div>
  </div>
);

export default Login;
