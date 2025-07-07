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
	Phone,
	User,
	Sparkles,
	UserPlus,
	LogIn,
	Calendar,
	MapPin,
	Shield,
} from 'lucide-react';

const AdminAuth = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [userType, setUserType] = useState('user');
	const [loginMethod, setLoginMethod] = useState('email');
	const [formData, setFormData] = useState({
		email: '',
		phone: '',
		userName: '',
		password: '',
		confirmPassword: '',
		fullName: '',
		age: '',
		bloodGroup: '',
		address: '',
		organizationName: '',
		licenseNumber: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentSlide, setCurrentSlide] = useState(0);

	const userTypes = [
		{
			id: 'user',
			label: 'Blood Donor',
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

	const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
	}, []);

	const handleSubmit = async () => {
		setIsLoading(true);
		setError('');
		try {
			await new Promise(resolve => setTimeout(resolve, 1500));
			alert(`${isLogin ? 'Login' : 'Registration'} successful! Welcome ${userType}`);
		} catch (err) {
			setError(`${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
		} finally {
			setIsLoading(false);
		}
	};

	const updateFormData = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const selectedType = userTypes.find(type => type.id === userType);

	return (
		<div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			{/* Enhanced Background */}
			<div className="absolute inset-0">
				<div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full filter blur-3xl animate-pulse"></div>
				<div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full filter blur-3xl animate-pulse delay-2000"></div>

				{/* Floating Elements */}
				{[...Array(20)].map((_, i) => (
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

			<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
					{/* Left - Hero Section */}
					<div className="space-y-8 text-center lg:text-left">
						<div className="flex justify-center lg:justify-start items-center space-x-4 mb-8">
							<div className="relative group">
								<div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
								<div className="relative w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
									<Heart className="w-10 h-10 text-white animate-pulse" />
								</div>
								<div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-spin">
									<Plus className="w-4 h-4 text-white" />
								</div>
							</div>
							<div>
								<h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent mb-2">
									LifeLink
								</h1>
								<div className="flex items-center justify-center lg:justify-start space-x-2">
									<Sparkles className="w-4 h-4 text-yellow-400" />
									<p className="text-gray-300 text-lg">
										Connecting hearts • Saving lives
									</p>
									<Sparkles className="w-4 h-4 text-yellow-400" />
								</div>
							</div>
						</div>

						{/* Quote Carousel */}
						<div className="relative h-40 overflow-hidden rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20 p-6">
							{inspirationalQuotes.map((quote, index) => (
								<div
									key={index}
									className={`absolute inset-0 p-6 transition-all duration-1000 ${
										index === currentSlide
											? 'opacity-100 translate-y-0'
											: 'opacity-0 translate-y-8'
									}`}
								>
									<div className="space-y-4 text-center">
										<div className="text-4xl mb-2">{quote.icon}</div>
										<h2 className="text-3xl lg:text-4xl font-bold text-white">
											{quote.text}
										</h2>
										<p className="text-gray-300 text-lg">{quote.subtext}</p>
									</div>
								</div>
							))}

							<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
								{inspirationalQuotes.map((_, index) => (
									<div
										key={index}
										className={`w-2 h-2 rounded-full transition-all ${
											index === currentSlide ? 'bg-white w-6' : 'bg-white/30'
										}`}
									></div>
								))}
							</div>
						</div>

						{/* Stats Section */}
						<div className="grid grid-cols-3 gap-4 mt-8">
							<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
								<div className="text-2xl font-bold text-red-400">10K+</div>
								<div className="text-sm text-gray-300">Lives Saved</div>
							</div>
							<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
								<div className="text-2xl font-bold text-blue-400">500+</div>
								<div className="text-sm text-gray-300">Hospitals</div>
							</div>
							<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
								<div className="text-2xl font-bold text-green-400">50K+</div>
								<div className="text-sm text-gray-300">Donors</div>
							</div>
						</div>
					</div>

					{/* Right - Auth Form */}
					<div className="relative">
						<div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
							{/* Login/Register Toggle */}
							<div className="flex mb-8 bg-white/5 rounded-2xl p-2">
								<button
									onClick={() => setIsLogin(true)}
									className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
										isLogin
											? `bg-gradient-to-r ${selectedType.color} text-white shadow-lg`
											: 'text-gray-300 hover:text-white'
									}`}
								>
									<LogIn className="inline-block w-5 h-5 mr-2" />
									Login
								</button>
								<button
									onClick={() => setIsLogin(false)}
									className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
										!isLogin
											? `bg-gradient-to-r ${selectedType.color} text-white shadow-lg`
											: 'text-gray-300 hover:text-white'
									}`}
								>
									<UserPlus className="inline-block w-5 h-5 mr-2" />
									Register
								</button>
							</div>

							{/* Form Header */}
							<div className="text-center mb-8">
								<div
									className={`w-16 h-16 bg-gradient-to-r ${selectedType.color} rounded-full flex items-center justify-center mx-auto mb-4`}
								>
									{isLogin ? (
										<LogIn className="w-8 h-8 text-white" />
									) : (
										<UserPlus className="w-8 h-8 text-white" />
									)}
								</div>
								<h3 className="text-3xl font-bold text-white mb-2">
									{isLogin ? 'Welcome Back' : 'Join LifeLink'}
								</h3>
								<p className="text-gray-300">
									{isLogin
										? 'Sign in to continue your journey'
										: 'Create account to start saving lives'}
								</p>
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
														userType === type.id
															? 'bg-white/20'
															: 'bg-white/10'
													}`}
												>
													<Icon className="w-7 h-7" />
												</div>
												<div className="text-left flex-1">
													<p className="font-semibold text-lg">
														{type.label}
													</p>
													<p className="text-sm opacity-80">
														{type.id === 'user'
															? 'Be a hero, save lives'
															: type.id === 'hospital'
															? 'Connect with donors'
															: 'Organize drives'}
													</p>
												</div>
												{userType === type.id && (
													<ArrowRight className="w-5 h-5" />
												)}
											</div>
										</button>
									);
								})}
							</div>

							{/* Login Method (User Only) */}
							{userType === 'user' && isLogin && (
								<div className="mb-6 flex space-x-2 bg-white/5 rounded-xl p-1">
									{[
										{ key: 'email', icon: Mail, label: 'Email' },
										{ key: 'phone', icon: Phone, label: 'Phone' },
										{ key: 'username', icon: User, label: 'Username' },
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

							{/* Form Fields */}
							<div className="space-y-6 max-h-96 overflow-y-auto pr-2">
								{/* Login Fields */}
								{isLogin ? (
									<>
										{userType === 'user' && loginMethod === 'email' && (
											<Input
												label="Email"
												type="email"
												icon={Mail}
												value={formData.email}
												setValue={val => updateFormData('email', val)}
											/>
										)}
										{userType === 'user' && loginMethod === 'phone' && (
											<Input
												label="Phone Number"
												type="text"
												icon={Phone}
												value={formData.phone}
												setValue={val => updateFormData('phone', val)}
											/>
										)}
										{userType === 'user' && loginMethod === 'username' && (
											<Input
												label="Username"
												type="text"
												icon={User}
												value={formData.userName}
												setValue={val => updateFormData('userName', val)}
											/>
										)}
										{userType !== 'user' && (
											<Input
												label="Email Address"
												type="email"
												icon={Mail}
												value={formData.email}
												setValue={val => updateFormData('email', val)}
											/>
										)}
										<Input
											label="Password"
											type={showPassword ? 'text' : 'password'}
											icon={Lock}
											value={formData.password}
											setValue={val => updateFormData('password', val)}
											toggleIcon={showPassword ? EyeOff : Eye}
											onToggle={() => setShowPassword(!showPassword)}
										/>
									</>
								) : (
									/* Register Fields */
									<>
										<Input
											label="Full Name"
											type="text"
											icon={User}
											value={formData.fullName}
											setValue={val => updateFormData('fullName', val)}
										/>
										<Input
											label="Email Address"
											type="email"
											icon={Mail}
											value={formData.email}
											setValue={val => updateFormData('email', val)}
										/>

										{userType === 'user' && (
											<>
												<div className="grid grid-cols-2 gap-4">
													<Input
														label="Age"
														type="number"
														icon={Calendar}
														value={formData.age}
														setValue={val => updateFormData('age', val)}
													/>
													<div className="relative">
														<label className="block text-sm font-medium text-gray-200 mb-3">
															Blood Group
														</label>
														<select
															value={formData.bloodGroup}
															onChange={e =>
																updateFormData(
																	'bloodGroup',
																	e.target.value,
																)
															}
															className="w-full py-4 px-4 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200"
														>
															<option value="">Select</option>
															{bloodGroups.map(group => (
																<option
																	key={group}
																	value={group}
																	className="bg-slate-800"
																>
																	{group}
																</option>
															))}
														</select>
													</div>
												</div>
												<Input
													label="Phone Number"
													type="text"
													icon={Phone}
													value={formData.phone}
													setValue={val => updateFormData('phone', val)}
												/>
												<Input
													label="Address"
													type="text"
													icon={MapPin}
													value={formData.address}
													setValue={val => updateFormData('address', val)}
												/>
											</>
										)}

										{userType !== 'user' && (
											<>
												<Input
													label="Organization Name"
													type="text"
													icon={Building2}
													value={formData.organizationName}
													setValue={val =>
														updateFormData('organizationName', val)
													}
												/>
												<Input
													label="License Number"
													type="text"
													icon={Shield}
													value={formData.licenseNumber}
													setValue={val =>
														updateFormData('licenseNumber', val)
													}
												/>
												<Input
													label="Phone Number"
													type="text"
													icon={Phone}
													value={formData.phone}
													setValue={val => updateFormData('phone', val)}
												/>
												<Input
													label="Address"
													type="text"
													icon={MapPin}
													value={formData.address}
													setValue={val => updateFormData('address', val)}
												/>
											</>
										)}

										<Input
											label="Password"
											type={showPassword ? 'text' : 'password'}
											icon={Lock}
											value={formData.password}
											setValue={val => updateFormData('password', val)}
											toggleIcon={showPassword ? EyeOff : Eye}
											onToggle={() => setShowPassword(!showPassword)}
										/>
										<Input
											label="Confirm Password"
											type={showConfirmPassword ? 'text' : 'password'}
											icon={Lock}
											value={formData.confirmPassword}
											setValue={val => updateFormData('confirmPassword', val)}
											toggleIcon={showConfirmPassword ? EyeOff : Eye}
											onToggle={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
										/>
									</>
								)}
							</div>

							{error && (
								<div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-sm mt-6">
									{error}
								</div>
							)}

							<button
								onClick={handleSubmit}
								disabled={isLoading}
								className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden mt-6 ${
									isLoading
										? 'bg-gray-600 cursor-not-allowed'
										: `bg-gradient-to-r ${selectedType.color} hover:shadow-2xl hover:scale-105 active:scale-95`
								}`}
							>
								{isLoading ? (
									<div className="flex items-center justify-center space-x-2">
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>
											{isLogin ? 'Logging in...' : 'Creating account...'}
										</span>
									</div>
								) : (
									<div className="flex items-center justify-center space-x-2">
										<span>{isLogin ? 'Sign In' : 'Create Account'}</span>
										<ArrowRight className="w-5 h-5" />
									</div>
								)}
							</button>

							{/* Switch Mode */}
							<div className="text-center mt-6">
								<p className="text-gray-300">
									{isLogin
										? "Don't have an account?"
										: 'Already have an account?'}
									<button
										onClick={() => setIsLogin(!isLogin)}
										className="text-white font-semibold ml-2 hover:underline"
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
	);
};

// Enhanced Input Component
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

export default AdminAuth;
