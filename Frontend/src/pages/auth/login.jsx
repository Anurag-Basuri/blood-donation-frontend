import { userLogin, hospitalLogin, ngoLogin, isAuthenticated } from '../../services/authService.js';
import { useState, useEffect } from 'react';
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
	Shield,
} from 'lucide-react';

const Login = () => {
	const [userType, setUserType] = useState('user');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [currentSlide, setCurrentSlide] = useState(0);

	const userTypes = [
		{
			id: 'user',
			label: 'Blood Donor',
			icon: Heart,
			color: 'from-red-500 via-pink-500 to-rose-500',
			bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
			description: 'Be a hero, save lives',
			tagline: 'Your blood can save up to 3 lives',
		},
		{
			id: 'hospital',
			label: 'Hospital',
			icon: Building2,
			color: 'from-blue-500 via-cyan-500 to-teal-500',
			bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
			description: 'Connect with donors instantly',
			tagline: 'Emergency? Find blood in seconds',
		},
		{
			id: 'ngo',
			label: 'NGO',
			icon: Users,
			color: 'from-green-500 via-emerald-500 to-teal-500',
			bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
			description: 'Organize life-saving drives',
			tagline: 'Build communities that care',
		},
	];

	const inspirationalQuotes = [
		{ text: 'Every drop counts', subtext: 'One donation can save three lives' },
		{ text: "Heroes don't wear capes", subtext: 'They donate blood' },
		{ text: 'Be the reason someone smiles', subtext: 'Donate blood, spread hope' },
		{ text: 'Life is in the blood', subtext: 'Share yours generously' },
	];

	useEffect(() => {
		const handleMouseMove = e => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide(prev => (prev + 1) % inspirationalQuotes.length);
		}, 4000);
		return () => clearInterval(interval);
	}, []);

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			await new Promise(resolve => setTimeout(resolve, 1500));
			console.log('Login attempt:', { userType, email, password });
			alert(`Welcome to LifeLink! Logged in as ${userType}!`);
		} catch (err) {
			setError(err.message || 'Something went wrong');
		} finally {
			setIsLoading(false);
		}
	};

	const selectedType = userTypes.find(type => type.id === userType);

	return (
		<div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			{/* Animated Background */}
			<div className="absolute inset-0">
				{/* Gradient Orbs */}
				<div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
				<div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
				<div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>

				{/* Animated Particles */}
				{[...Array(20)].map((_, i) => (
					<div
						key={i}
						className="absolute animate-float-random opacity-30"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${5 + Math.random() * 5}s`,
						}}
					>
						{i % 4 === 0 && <Heart className="w-3 h-3 text-red-400" />}
						{i % 4 === 1 && <Droplets className="w-3 h-3 text-blue-400" />}
						{i % 4 === 2 && <Plus className="w-3 h-3 text-green-400" />}
						{i % 4 === 3 && <Activity className="w-3 h-3 text-purple-400" />}
					</div>
				))}
			</div>

			{/* Mouse Follow Effect */}
			<div
				className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
				style={{
					left: mousePosition.x - 192,
					top: mousePosition.y - 192,
					background: `radial-gradient(circle, ${
						selectedType.color.includes('red')
							? 'rgba(239, 68, 68, 0.1)'
							: selectedType.color.includes('blue')
							? 'rgba(59, 130, 246, 0.1)'
							: 'rgba(34, 197, 94, 0.1)'
					} 0%, transparent 70%)`,
				}}
			/>

			<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
					{/* Left Side - Hero Section */}
					<div className="text-center lg:text-left space-y-8">
						{/* Logo */}
						<div className="flex items-center justify-center lg:justify-start space-x-4">
							<div className="relative">
								<div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
									<Heart className="w-8 h-8 text-white animate-pulse" />
								</div>
								<div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
									<Plus className="w-3 h-3 text-white" />
								</div>
							</div>
							<div>
								<h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
									LifeLink
								</h1>
								<p className="text-gray-300 text-sm">
									Connecting hearts • Saving lives
								</p>
							</div>
						</div>

						{/* Quote Carousel */}
						<div className="relative h-32 overflow-hidden">
							{inspirationalQuotes.map((quote, index) => (
								<div
									key={index}
									className={`absolute inset-0 transition-all duration-1000 ${
										index === currentSlide
											? 'opacity-100 translate-y-0'
											: 'opacity-0 translate-y-8'
									}`}
								>
									<div className="space-y-4">
										<h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
											{quote.text}
										</h2>
										<p className="text-gray-300 text-lg">{quote.subtext}</p>
									</div>
								</div>
							))}
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-4 text-center">
							<div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
								<div className="text-2xl font-bold text-white">10K+</div>
								<div className="text-sm text-gray-300">Lives Saved</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
								<div className="text-2xl font-bold text-white">500+</div>
								<div className="text-sm text-gray-300">Hospitals</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
								<div className="text-2xl font-bold text-white">5K+</div>
								<div className="text-sm text-gray-300">Donors</div>
							</div>
						</div>
					</div>

					{/* Right Side - Login Form */}
					<div className="relative">
						{/* Floating Elements Around Form */}
						<div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-bounce delay-1000"></div>
						<div className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce delay-2000"></div>
						<div className="absolute -bottom-4 -left-2 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-bounce"></div>

						{/* Main Form Card */}
						<div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
							{/* Animated Background Pattern */}
							<div className="absolute inset-0 opacity-5">
								<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20"></div>
								<div className="absolute top-4 left-4 w-32 h-32 border border-white/20 rounded-full"></div>
								<div className="absolute bottom-4 right-4 w-24 h-24 border border-white/20 rounded-full"></div>
							</div>

							<div className="relative z-10">
								{/* Form Header */}
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold text-white mb-2">
										Welcome Back
									</h3>
									<p className="text-gray-300">
										Sign in to continue your journey
									</p>
								</div>

								{/* User Type Selection */}
								<div className="mb-8">
									<label className="block text-sm font-medium text-gray-200 mb-4">
										Choose your role
									</label>
									<div className="grid grid-cols-1 gap-3">
										{userTypes.map(type => {
											const Icon = type.icon;
											return (
												<button
													key={type.id}
													type="button"
													onClick={() => setUserType(type.id)}
													className={`relative p-4 rounded-xl border-2 transition-all duration-500 group ${
														userType === type.id
															? 'border-transparent bg-gradient-to-r ' +
															  type.color +
															  ' text-white shadow-lg transform scale-105'
															: 'border-white/20 hover:border-white/40 bg-white/5 text-gray-200 hover:bg-white/10'
													}`}
												>
													<div className="flex items-center space-x-4">
														<div
															className={`w-12 h-12 rounded-full flex items-center justify-center ${
																userType === type.id
																	? 'bg-white/20'
																	: 'bg-white/10'
															}`}
														>
															<Icon className="w-6 h-6" />
														</div>
														<div className="text-left">
															<p className="font-semibold">
																{type.label}
															</p>
															<p className="text-sm opacity-80">
																{type.description}
															</p>
														</div>
													</div>

													{/* Selection indicator */}
													{userType === type.id && (
														<div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
															<div className="w-3 h-3 bg-white rounded-full"></div>
														</div>
													)}
												</button>
											);
										})}
									</div>
								</div>

								{/* Login Form */}
								<div className="space-y-6">
									{/* Email Field */}
									<div className="relative">
										<label className="block text-sm font-medium text-gray-200 mb-2">
											Email Address
										</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
												<Mail className="h-5 w-5 text-gray-400" />
											</div>
											<input
												type="email"
												value={email}
												onChange={e => setEmail(e.target.value)}
												className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
												placeholder="Enter your email"
												required
											/>
										</div>
									</div>

									{/* Password Field */}
									<div className="relative">
										<label className="block text-sm font-medium text-gray-200 mb-2">
											Password
										</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
												<Lock className="h-5 w-5 text-gray-400" />
											</div>
											<input
												type={showPassword ? 'text' : 'password'}
												value={password}
												onChange={e => setPassword(e.target.value)}
												className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
												placeholder="Enter your password"
												required
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute inset-y-0 right-0 pr-4 flex items-center"
											>
												{showPassword ? (
													<EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
												) : (
													<Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
												)}
											</button>
										</div>
									</div>

									{/* Error Message */}
									{error && (
										<div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
											<p className="text-sm text-red-200">{error}</p>
										</div>
									)}

									{/* Submit Button */}
									<button
										type="button"
										onClick={handleSubmit}
										disabled={isLoading}
										className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-500 relative overflow-hidden group ${
											isLoading
												? 'bg-gray-600 cursor-not-allowed'
												: `bg-gradient-to-r ${selectedType.color} hover:shadow-2xl hover:scale-105 active:scale-95`
										}`}
									>
										{/* Button Background Animation */}
										<div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

										<div className="relative flex items-center justify-center space-x-2">
											{isLoading ? (
												<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											) : (
												<>
													<span className="text-lg">Sign In</span>
													<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
												</>
											)}
										</div>
									</button>
								</div>

								{/* Footer Links */}
								<div className="mt-8 text-center space-y-4">
									<button className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
										Forgot your password?
									</button>
									<div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
										<span>New to LifeLink?</span>
										<button className="text-white font-medium hover:text-gray-200 transition-colors duration-200">
											Join us now
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CSS Animations */}
			<style jsx>{`
				@keyframes float-random {
					0%,
					100% {
						transform: translateY(0px) translateX(0px) rotate(0deg);
					}
					25% {
						transform: translateY(-20px) translateX(10px) rotate(90deg);
					}
					50% {
						transform: translateY(-10px) translateX(-10px) rotate(180deg);
					}
					75% {
						transform: translateY(-30px) translateX(5px) rotate(270deg);
					}
				}
				.animate-float-random {
					animation: float-random 6s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
};

export default Login;
