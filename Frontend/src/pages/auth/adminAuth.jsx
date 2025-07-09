import { useState, useEffect } from 'react';
import {
	Heart,
	Droplets,
	Plus,
	UserPlus,
	LogIn,
	ArrowRight,
	Sparkles,
	Eye,
	EyeOff,
} from 'lucide-react';
import { axiosInstance } from '../../services/api.js';

const AdminAuth = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
		secretKey: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentSlide, setCurrentSlide] = useState(0);

	const inspirationalQuotes = [
		{ text: 'Join the Heroes', subtext: 'Every new donor is a lifesaver', icon: '🦸‍♂️' },
		{ text: 'Start Your Journey', subtext: 'One registration, countless lives', icon: '🚀' },
		{ text: 'Welcome Back', subtext: 'Ready to save more lives?', icon: '👋' },
		{ text: 'Make a Difference', subtext: 'Your blood, their hope', icon: '✨' },
	];

	useEffect(() => {
		const interval = setInterval(
			() => setCurrentSlide(prev => (prev + 1) % inspirationalQuotes.length),
			4000,
		);
		return () => clearInterval(interval);
	}, [inspirationalQuotes.length]);

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (error) setError('');
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setError('');

		try {
			// Validation
			if (isLogin) {
				if (!formData.email || !formData.password || !formData.secretKey) {
					setError('Email, password, and secret key are required.');
					setIsLoading(false);
					return;
				}

				const response = await axiosInstance.post('/admin/login', formData);
				if (response.status !== 200) {
					setError('Login failed. Please check your credentials.');
					setIsLoading(false);
					return;
				}
				console.log('Login successful:', response.data);
			} else {
				if (
					!formData.fullName ||
					!formData.email ||
					!formData.password ||
					!formData.confirmPassword ||
					!formData.secretKey
				) {
					setError('All fields are required.');
					setIsLoading(false);
					return;
				}
				if (formData.password !== formData.confirmPassword) {
					setError('Passwords do not match.');
					setIsLoading(false);
					return;
				}

				const response = await axiosInstance.post('/admin/register', formData);
				if (response.status !== 201) {
					setError('Registration failed. Please try again.');
					setIsLoading(false);
					return;
				}
				console.log('Registration successful:', response.data);
			}

			await new Promise(resolve => setTimeout(resolve, 1500));
			alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
		} catch {
			setError(`${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			fullName: '',
			email: '',
			password: '',
			confirmPassword: '',
			secretKey: '',
		});
		setError('');
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		resetForm();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
			{/* Enhanced Background */}
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
						{i % 4 === 0 && <Heart className="w-4 h-4 text-red-400" />}
						{i % 4 === 1 && <Droplets className="w-4 h-4 text-blue-400" />}
						{i % 4 === 2 && <Plus className="w-4 h-4 text-green-400" />}
						{i % 4 === 3 && <UserPlus className="w-4 h-4 text-purple-400" />}
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
									<h2 className="text-2xl font-bold text-white drop-shadow">
										{quote.text}
									</h2>
									<p className="text-gray-200 text-base">{quote.subtext}</p>
								</div>
							))}
							<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
								{inspirationalQuotes.map((_, index) => (
									<div
										key={index}
										className={`h-2 rounded-full transition-all duration-300 ${
											index === currentSlide
												? 'bg-white w-6'
												: 'bg-white/30 w-2'
										}`}
									></div>
								))}
							</div>
						</div>

						{/* Stats Section */}
						<div className="grid grid-cols-3 gap-4 mt-6">
							<div className="text-center p-5 bg-white/10 rounded-xl backdrop-blur border border-white/10 shadow">
								<div className="text-2xl font-bold text-red-400 drop-shadow">
									10K+
								</div>
								<div className="text-xs text-gray-200">Lives Saved</div>
							</div>
							<div className="text-center p-5 bg-white/10 rounded-xl backdrop-blur border border-white/10 shadow">
								<div className="text-2xl font-bold text-blue-400 drop-shadow">
									500+
								</div>
								<div className="text-xs text-gray-200">Hospitals</div>
							</div>
							<div className="text-center p-5 bg-white/10 rounded-xl backdrop-blur border border-white/10 shadow">
								<div className="text-2xl font-bold text-green-400 drop-shadow">
									50K+
								</div>
								<div className="text-xs text-gray-200">Donors</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Scrollable Auth Form */}
				<div className="w-full lg:w-1/2 h-screen overflow-y-auto">
					<div className="min-h-full flex items-center justify-center p-4 lg:p-8">
						<div className="w-full max-w-md">
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

							<div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
								{/* Login/Register Toggle */}
								<div className="flex mb-6 bg-white/5 rounded-2xl p-2">
									<button
										onClick={toggleMode}
										className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
											isLogin
												? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
												: 'text-gray-300 hover:text-white'
										}`}
									>
										<LogIn className="inline-block w-4 h-4 mr-2" />
										Login
									</button>
									<button
										onClick={toggleMode}
										className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
											!isLogin
												? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
												: 'text-gray-300 hover:text-white'
										}`}
									>
										<UserPlus className="inline-block w-4 h-4 mr-2" />
										Register
									</button>
								</div>

								{/* Form Header */}
								<div className="text-center mb-6">
									<div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
										{isLogin ? (
											<LogIn className="w-6 h-6 text-white" />
										) : (
											<UserPlus className="w-6 h-6 text-white" />
										)}
									</div>
									<h3 className="text-2xl font-bold text-white mb-2">
										{isLogin ? 'Welcome Back' : 'Join LifeLink'}
									</h3>
									<p className="text-gray-300 text-sm">
										{isLogin
											? 'Sign in to continue your journey'
											: 'Create account to start saving lives'}
									</p>
								</div>

								<div className="space-y-4">
									{!isLogin && (
										<div>
											<label className="block text-white text-sm font-medium mb-2">
												Full Name
											</label>
											<input
												type="text"
												name="fullName"
												value={formData.fullName}
												onChange={handleChange}
												className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder-gray-400"
												placeholder="Enter your full name"
											/>
										</div>
									)}

									<div>
										<label className="block text-white text-sm font-medium mb-2">
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder-gray-400"
											placeholder="Enter your email"
										/>
									</div>

									<div>
										<label className="block text-white text-sm font-medium mb-2">
											Secret Key
										</label>
										<input
											type="password"
											name="secretKey"
											value={formData.secretKey}
											onChange={handleChange}
											className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder-gray-400"
											placeholder="Enter your secret key"
										/>
									</div>

									<div className="relative">
										<label className="block text-white text-sm font-medium mb-2">
											Password
										</label>
										<input
											type={showPassword ? 'text' : 'password'}
											name="password"
											value={formData.password}
											onChange={handleChange}
											className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder-gray-400"
											placeholder="Enter your password"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-10 text-gray-400 hover:text-white transition-colors"
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>

									{!isLogin && (
										<div className="relative">
											<label className="block text-white text-sm font-medium mb-2">
												Confirm Password
											</label>
											<input
												type={showConfirmPassword ? 'text' : 'password'}
												name="confirmPassword"
												value={formData.confirmPassword}
												onChange={handleChange}
												className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all placeholder-gray-400"
												placeholder="Confirm your password"
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute right-3 top-10 text-gray-400 hover:text-white transition-colors"
											>
												{showConfirmPassword ? (
													<EyeOff className="w-5 h-5" />
												) : (
													<Eye className="w-5 h-5" />
												)}
											</button>
										</div>
									)}

									{error && (
										<div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-sm">
											{error}
										</div>
									)}

									<button
										onClick={handleSubmit}
										disabled={isLoading}
										className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden ${
											isLoading
												? 'bg-gray-600 cursor-not-allowed'
												: 'bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg'
										}`}
									>
										{isLoading ? (
											<div className="flex items-center justify-center space-x-2">
												<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
												<span>
													{isLogin
														? 'Logging in...'
														: 'Creating account...'}
												</span>
											</div>
										) : (
											<div className="flex items-center justify-center space-x-2">
												<span>
													{isLogin ? 'Sign In' : 'Create Account'}
												</span>
												<ArrowRight className="w-5 h-5" />
											</div>
										)}
									</button>
								</div>

								{/* Switch Mode */}
								<div className="text-center mt-6">
									<p className="text-gray-300 text-sm">
										{isLogin
											? "Don't have an account?"
											: 'Already have an account?'}
										<button
											onClick={toggleMode}
											className="text-white font-semibold ml-2 hover:underline transition-colors"
										>
											{isLogin ? 'Sign up' : 'Sign in'}
										</button>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminAuth;