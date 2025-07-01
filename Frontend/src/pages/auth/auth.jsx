import { useState } from 'react';

const Auth = () => {
	const [isRegistering, setIsRegistering] = useState(false);
	const [formData, setFormData] = useState({
		accountType: '',
		fullName: '',
		email: '',
		phone: '',
		bloodType: '',
		password: '',
		confirmPassword: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [focusedField, setFocusedField] = useState('');

	const toggleForm = () => {
		setIsRegistering(!isRegistering);
		setFormData({
			accountType: '',
			fullName: '',
			email: '',
			phone: '',
			bloodType: '',
			password: '',
			confirmPassword: '',
		});
		setError('');
	};

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setLoading(true);
		setError('');

		// Simulate API call
		setTimeout(() => {
			if (isRegistering) {
				console.log('Registration data:', formData);
			} else {
				console.log('Login data:', { email: formData.email, password: formData.password });
			}
			setLoading(false);
		}, 2000);
	};

	const showBloodTypes = formData.accountType === 'donor';

	// Floating elements for background animation
	const FloatingElement = ({ size, delay, duration, className }) => (
		<div
			className={`absolute rounded-full opacity-20 ${className}`}
			style={{
				width: size,
				height: size,
				animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
			}}
		/>
	);

	return (
		<div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-600 to-purple-700">
			{/* Animated Background Elements */}
			<div className="absolute inset-0">
				<FloatingElement
					size="120px"
					delay="0"
					duration="3"
					className="bg-white/10 top-10 left-10"
				/>
				<FloatingElement
					size="80px"
					delay="1"
					duration="4"
					className="bg-red-300/20 top-20 right-20"
				/>
				<FloatingElement
					size="60px"
					delay="2"
					duration="3.5"
					className="bg-pink-300/20 bottom-32 left-16"
				/>
				<FloatingElement
					size="100px"
					delay="0.5"
					duration="4.5"
					className="bg-purple-300/20 bottom-20 right-32"
				/>
				<FloatingElement
					size="40px"
					delay="1.5"
					duration="3"
					className="bg-white/15 top-1/2 left-1/4"
				/>
				<FloatingElement
					size="70px"
					delay="2.5"
					duration="4"
					className="bg-red-200/20 top-1/3 right-1/3"
				/>
			</div>

			{/* Gradient Orbs */}
			<div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-red-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
			<div
				className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
				style={{ animationDelay: '1s' }}
			></div>

			<div className="relative z-10 min-h-screen flex justify-center items-center px-4">
				<div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
					{/* Header with Icon */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4 shadow-lg animate-bounce">
							<svg
								className="w-8 h-8 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<h2 className="text-4xl font-bold text-white mb-2 transition-all duration-500">
							{isRegistering ? 'Join LifeConnect' : 'Welcome Back'}
						</h2>
						<p className="text-white/80 text-sm">
							{isRegistering
								? 'Create your account to start saving lives'
								: 'Sign in to continue your journey'}
						</p>
					</div>

					{/* Error Message with Animation */}
					{error && (
						<div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 animate-shake">
							<div className="flex items-center">
								<svg
									className="w-5 h-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								{error}
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Registration Fields */}
						<div
							className={`space-y-6 transition-all duration-500 ${
								isRegistering
									? 'opacity-100 max-h-96'
									: 'opacity-0 max-h-0 overflow-hidden'
							}`}
						>
							{/* Account Type Selector */}
							<div className="relative">
								<select
									name="accountType"
									value={formData.accountType}
									onChange={handleChange}
									onFocus={() => setFocusedField('accountType')}
									onBlur={() => setFocusedField('')}
									className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
									required={isRegistering}
								>
									<option value="" className="text-gray-800">
										Select Account Type
									</option>
									<option value="donor" className="text-gray-800">
										🩸 Blood Donor
									</option>
									<option value="hospital" className="text-gray-800">
										🏥 Hospital
									</option>
									<option value="ngo" className="text-gray-800">
										🤝 NGO
									</option>
									<option value="volunteer" className="text-gray-800">
										👥 Volunteer
									</option>
								</select>
								<div
									className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
										focusedField === 'accountType' ? 'w-full' : 'w-0'
									}`}
								/>
							</div>

							{/* Full Name Input */}
							<div className="relative group">
								<input
									type="text"
									name="fullName"
									placeholder="Full Name"
									value={formData.fullName}
									onChange={handleChange}
									onFocus={() => setFocusedField('fullName')}
									onBlur={() => setFocusedField('')}
									required={isRegistering}
									className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
								/>
								<div
									className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
										focusedField === 'fullName' ? 'w-full' : 'w-0'
									}`}
								/>
							</div>

							{/* Phone Input */}
							<div className="relative group">
								<input
									type="tel"
									name="phone"
									placeholder="Phone Number"
									value={formData.phone}
									onChange={handleChange}
									onFocus={() => setFocusedField('phone')}
									onBlur={() => setFocusedField('')}
									required={isRegistering}
									className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
								/>
								<div
									className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
										focusedField === 'phone' ? 'w-full' : 'w-0'
									}`}
								/>
							</div>
						</div>

						{/* Email Input */}
						<div className="relative group">
							<input
								type="email"
								name="email"
								placeholder="Email Address"
								value={formData.email}
								onChange={handleChange}
								onFocus={() => setFocusedField('email')}
								onBlur={() => setFocusedField('')}
								required
								className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
							/>
							<div
								className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
									focusedField === 'email' ? 'w-full' : 'w-0'
								}`}
							/>
						</div>

						{/* Password Input */}
						<div className="relative group">
							<input
								type="password"
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								onFocus={() => setFocusedField('password')}
								onBlur={() => setFocusedField('')}
								required
								className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
							/>
							<div
								className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
									focusedField === 'password' ? 'w-full' : 'w-0'
								}`}
							/>
						</div>

						{/* Additional Registration Fields */}
						<div
							className={`space-y-6 transition-all duration-500 ${
								isRegistering
									? 'opacity-100 max-h-96'
									: 'opacity-0 max-h-0 overflow-hidden'
							}`}
						>
							{/* Confirm Password */}
							<div className="relative group">
								<input
									type="password"
									name="confirmPassword"
									placeholder="Confirm Password"
									value={formData.confirmPassword}
									onChange={handleChange}
									onFocus={() => setFocusedField('confirmPassword')}
									onBlur={() => setFocusedField('')}
									required={isRegistering}
									className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
								/>
								<div
									className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
										focusedField === 'confirmPassword' ? 'w-full' : 'w-0'
									}`}
								/>
							</div>

							{/* Blood Type Selector */}
							{showBloodTypes && (
								<div className="relative animate-slideDown">
									<select
										name="bloodType"
										value={formData.bloodType}
										onChange={handleChange}
										onFocus={() => setFocusedField('bloodType')}
										onBlur={() => setFocusedField('')}
										className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
										required
									>
										<option value="" className="text-gray-800">
											Select Blood Type
										</option>
										<option value="A+" className="text-gray-800">
											A+ (A Positive)
										</option>
										<option value="A-" className="text-gray-800">
											A- (A Negative)
										</option>
										<option value="B+" className="text-gray-800">
											B+ (B Positive)
										</option>
										<option value="B-" className="text-gray-800">
											B- (B Negative)
										</option>
										<option value="AB+" className="text-gray-800">
											AB+ (AB Positive)
										</option>
										<option value="AB-" className="text-gray-800">
											AB- (AB Negative)
										</option>
										<option value="O+" className="text-gray-800">
											O+ (O Positive)
										</option>
										<option value="O-" className="text-gray-800">
											O- (O Negative)
										</option>
									</select>
									<div
										className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300 ${
											focusedField === 'bloodType' ? 'w-full' : 'w-0'
										}`}
									/>
								</div>
							)}
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden ${
								isRegistering
									? 'bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600'
									: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
							}`}
							disabled={loading}
						>
							<span
								className={`transition-opacity duration-300 ${
									loading ? 'opacity-0' : 'opacity-100'
								}`}
							>
								{isRegistering ? '🌟 Create Account' : '🚀 Sign In'}
							</span>

							{loading && (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span className="ml-2">Processing...</span>
								</div>
							)}
						</button>
					</form>

					{/* Toggle Form Button */}
					<div className="mt-8 text-center">
						<button
							onClick={toggleForm}
							className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 transform"
						>
							<span className="text-sm">
								{isRegistering
									? '👋 Already have an account? '
									: "🎯 Don't have an account? "}
							</span>
							<span className="font-semibold underline decoration-2 underline-offset-4 decoration-pink-400">
								{isRegistering ? 'Sign In' : 'Join Now'}
							</span>
						</button>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes float {
					from {
						transform: translateY(0px);
					}
					to {
						transform: translateY(-20px);
					}
				}

				@keyframes shake {
					0%,
					100% {
						transform: translateX(0);
					}
					25% {
						transform: translateX(-5px);
					}
					75% {
						transform: translateX(5px);
					}
				}

				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-shake {
					animation: shake 0.5s ease-in-out;
				}

				.animate-slideDown {
					animation: slideDown 0.3s ease-out;
				}
			`}</style>
		</div>
	);
};

export default Auth;
