import React, { useState, useEffect } from 'react';
import { FormProvider } from './context/FormContext';
import AccountTypeStep from './components/AccountTypeStep';
import UserRegistration from './registerUser.jsx'
import NGORegistration from './components/NGORegistration';
import HospitalRegistration from './components/HospitalRegistration';
import SuccessStep from './components/SuccessStep';
import {
	Heart,
	Building2,
	Users,
	ArrowRight,
	CheckCircle2,
	Sparkles,
	Droplets,
	Plus,
	ChevronLeft,
} from 'lucide-react';

const Register = () => {
	const [step, setStep] = useState(0);
	const [role, setRole] = useState('user');
	const [currentQuote, setCurrentQuote] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	const quotes = [
		'Every drop counts. Be a hero today.',
		"Your blood could be someone's lifeline.",
		'Donating blood saves up to three lives.',
		'The gift of blood is the gift of life.',
	];

	const next = () => {
		setIsAnimating(true);
		setTimeout(() => {
			setStep(s => s + 1);
			setIsAnimating(false);
		}, 300);
	};

	const prev = () => {
		setIsAnimating(true);
		setTimeout(() => {
			setStep(s => s - 1);
			setIsAnimating(false);
		}, 300);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentQuote(prev => (prev + 1) % quotes.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<FormProvider>
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

				<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
					<div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12">
						{/* Left Side - Hero Section */}
						<div className="hidden lg:block">
							<div className="flex flex-col justify-center h-full space-y-8">
								<div className="flex items-center space-x-4 mb-8">
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
										<h1 className="text-5xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent mb-2">
											LifeLink
										</h1>
										<div className="flex items-center space-x-2">
											<Sparkles className="w-4 h-4 text-yellow-400" />
											<p className="text-gray-300 text-lg">
												Connecting hearts • Saving lives
											</p>
											<Sparkles className="w-4 h-4 text-yellow-400" />
										</div>
									</div>
								</div>

								{/* Quote Section */}
								<div className="relative h-40 overflow-hidden rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20 p-6 transition-all duration-1000">
									<div className="space-y-4 text-center">
										<div className="text-4xl mb-2 transition-all duration-1000 transform rotate-12 scale-110">
											💖
										</div>
										<h2 className="text-3xl font-bold text-white transition-all duration-1000">
											{quotes[currentQuote]}
										</h2>
									</div>
								</div>

								{/* Stats Section */}
								<div className="grid grid-cols-3 gap-4">
									<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer">
										<div className="text-2xl font-bold text-red-400">10K+</div>
										<div className="text-sm text-gray-300">Lives Saved</div>
									</div>
									<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer">
										<div className="text-2xl font-bold text-blue-400">500+</div>
										<div className="text-sm text-gray-300">Hospitals</div>
									</div>
									<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer">
										<div className="text-2xl font-bold text-green-400">
											50K+
										</div>
										<div className="text-sm text-gray-300">Donors</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Side - Registration Form */}
						<div
							className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 ${
								isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
							}`}
						>
							{/* Step Progress */}
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center">
									{step > 0 && (
										<button
											onClick={prev}
											className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
										>
											<ChevronLeft className="w-5 h-5 text-white" />
										</button>
									)}
									<h2 className="text-2xl font-bold text-white">
										{step === 0
											? 'Create Account'
											: step === 1
											? 'Registration'
											: 'Success!'}
									</h2>
								</div>
								<div className="flex items-center">
									{[0, 1, 2].map(s => (
										<div
											key={s}
											className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
												step === s
													? 'bg-white w-6'
													: step > s
													? 'bg-green-500'
													: 'bg-white/30'
											}`}
										></div>
									))}
								</div>
							</div>

							{step === 0 && <AccountTypeStep setRole={setRole} next={next} />}
							{step === 1 && role === 'user' && (
								<UserRegistration next={next} prev={prev} />
							)}
							{step === 1 && role === 'ngo' && (
								<NGORegistration next={next} prev={prev} />
							)}
							{step === 1 && role === 'hospital' && (
								<HospitalRegistration next={next} prev={prev} />
							)}
							{step === 2 && <SuccessStep />}
						</div>
					</div>
				</div>
			</div>
		</FormProvider>
	);
};

export default Register;
