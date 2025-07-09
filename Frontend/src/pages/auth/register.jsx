import { useState } from 'react';
import { RegisterUser } from './registerUser.jsx';
import { RegisterNGO } from './registerNGO.jsx';
import { RegisterHospital } from './registerHospital.jsx';
import { FormProvider } from '../../context/FormContext';
import {
	Heart,
	Building2,
	Users,
	ArrowRight,
	CheckCircle2,
	Sparkles,
	Droplets,
	Plus,
} from 'lucide-react';

const roles = [
	{
		id: 'user',
		label: 'Normal User',
		icon: Heart,
		color: 'from-red-500 via-pink-500 to-rose-500',
		description: 'Register to donate blood and save lives',
	},
	{
		id: 'ngo',
		label: 'NGO',
		icon: Users,
		color: 'from-green-500 via-emerald-500 to-teal-500',
		description: 'Register your organization to organize blood drives',
	},
	{
		id: 'hospital',
		label: 'Hospital',
		icon: Building2,
		color: 'from-blue-500 via-cyan-500 to-teal-500',
		description: 'Register your hospital to connect with donors',
	},
];

export default function Register() {
	const [step, setStep] = useState(0);
	const [role, setRole] = useState('user');
	const [currentQuote, setCurrentQuote] = useState(0);

	const quotes = [
		'Every drop counts. Be a hero today.',
		"Your blood could be someone's lifeline.",
		'Donating blood saves up to three lives.',
		'The gift of blood is the gift of life.',
	];

	const next = () => setStep(s => s + 1);
	const prev = () => setStep(s => s - 1);

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
					<div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12">
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
								<div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20 p-6">
									<div className="space-y-4 text-center">
										<div className="text-4xl mb-2">💖</div>
										<h2 className="text-3xl font-bold text-white">
											{quotes[currentQuote]}
										</h2>
									</div>
								</div>

								{/* Stats Section */}
								<div className="grid grid-cols-3 gap-4">
									<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
										<div className="text-2xl font-bold text-red-400">10K+</div>
										<div className="text-sm text-gray-300">Lives Saved</div>
									</div>
									<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
										<div className="text-2xl font-bold text-blue-400">500+</div>
										<div className="text-sm text-gray-300">Hospitals</div>
									</div>
									<div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
										<div className="text-2xl font-bold text-green-400">
											50K+
										</div>
										<div className="text-sm text-gray-300">Donors</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Side - Registration Form */}
						<div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
							{step === 0 && (
								<div className="space-y-8">
									<div className="text-center">
										<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
											<Users className="w-8 h-8 text-white" />
										</div>
										<h2 className="text-3xl font-bold text-white mb-2">
											Create Your Account
										</h2>
										<p className="text-gray-300">
											Join our lifesaving community today
										</p>
									</div>

									<div className="space-y-4">
										<h3 className="text-xl font-semibold text-white mb-4">
											Select Account Type
										</h3>
										<div className="grid grid-cols-1 gap-4">
											{roles.map(r => (
												<button
													key={r.id}
													onClick={() => {
														setRole(r.id);
														next();
													}}
													className={`p-6 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden text-left ${
														role === r.id
															? `bg-gradient-to-r ${r.color} text-white shadow-lg border-transparent`
															: `border-white/20 hover:border-white/40 bg-white/5 text-gray-200 hover:scale-102`
													}`}
												>
													<div className="flex items-center space-x-4 relative z-10">
														<div
															className={`w-14 h-14 rounded-full flex items-center justify-center ${
																role === r.id
																	? 'bg-white/20'
																	: 'bg-white/10'
															}`}
														>
															<r.icon className="w-7 h-7" />
														</div>
														<div>
															<p className="font-semibold text-lg">
																{r.label}
															</p>
															<p className="text-sm opacity-80">
																{r.description}
															</p>
														</div>
													</div>
												</button>
											))}
										</div>
									</div>
								</div>
							)}

							{step === 1 && role === 'user' && (
								<RegisterUser next={next} prev={prev} />
							)}
							{step === 1 && role === 'ngo' && (
								<RegisterNGO next={next} prev={prev} />
							)}
							{step === 1 && role === 'hospital' && (
								<RegisterHospital next={next} prev={prev} />
							)}

							{step === 2 && (
								<div className="text-center py-12">
									<div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
										<CheckCircle2 className="w-12 h-12 text-white" />
									</div>
									<h2 className="text-3xl font-bold text-white mb-4">
										Registration Complete!
									</h2>
									<p className="text-gray-300 mb-8">
										Please check your email to verify your account
									</p>
									<div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
										<h3 className="text-xl font-semibold text-white mb-2">
											What's Next?
										</h3>
										<ul className="text-gray-300 space-y-2 text-left max-w-xs mx-auto">
											<li className="flex items-center">
												<span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
													1
												</span>
												Verify your email address
											</li>
											<li className="flex items-center">
												<span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
													2
												</span>
												Complete your profile
											</li>
											<li className="flex items-center">
												<span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
													3
												</span>
												Start saving lives!
											</li>
										</ul>
									</div>
									<button
										onClick={() => setStep(0)}
										className="mt-8 w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl transition-all"
									>
										Back to Login
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</FormProvider>
	);
}