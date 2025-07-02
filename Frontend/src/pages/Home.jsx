import React, { useState, useEffect } from 'react';
import { useInView, useAnimation, motion } from 'framer-motion';
import {
	FiDroplet,
	FiHeart,
	FiUsers,
	FiChevronRight,
	FiMapPin,
	FiSearch,
	FiMenu,
	FiX,
	FiUser,
	FiFacebook,
	FiTwitter,
	FiInstagram,
	FiLinkedin,
	FiYoutube,
	FiClock,
} from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import SectionHeading from '../components/SectionHeading.jsx';
import StatsCard from '../components/StatsCard.jsx';
import TestimonialCarousel from '../components/TestimonialCarousel.jsx';
import ProcessStep from '../components/ProcessStep.jsx';

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(true);
	const [userType] = useState('user'); // 'user' or 'ngo'

	const navigation = [
		{ name: 'Home', href: '/', current: true },
		{ name: 'About', href: '/about', current: false },
		{ name: 'Donate', href: '/donate', current: false },
		{ name: 'Contact', href: '/contact', current: false },
		{
			name: 'Dashboard',
			href: userType === 'ngo' ? '/ngodashboard' : '/userdashboard',
			current: false,
		},
	];

	return (
		<header className="sticky top-0 z-50 bg-white shadow-sm">
			<nav className="container mx-auto px-4 py-3 flex items-center justify-between">
				{/* Logo */}
				<a href="/" className="flex items-center space-x-2">
					<FiDroplet className="w-7 h-7 bg-gradient-to-r from-red-600 to-red-700 text-white p-1.5 rounded-full" />
					<span className="text-2xl font-bold text-red-700">Lifesaver</span>
				</a>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center space-x-6">
					{navigation.map(item => (
						<a
							key={item.name}
							href={item.href}
							className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								item.current
									? 'bg-red-100 text-red-700'
									: 'text-gray-700 hover:bg-red-50 hover:text-red-700'
							}`}
						>
							{item.name}
						</a>
					))}
				</div>

				{/* Right Section */}
				<div className="flex items-center space-x-4">
					{isLoggedIn ? (
						<Menu as="div" className="relative">
							<Menu.Button className="flex items-center space-x-2 focus:outline-none">
								<div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors">
									<FiUser className="text-red-700" />
								</div>
							</Menu.Button>
							<Transition
								enter="transition ease-out duration-100"
								enterFrom="transform opacity-0 scale-95"
								enterTo="transform opacity-1 scale-100"
								leave="transition ease-in duration-75"
								leaveFrom="transform opacity-1 scale-100"
								leaveTo="transform opacity-0 scale-95"
							>
								<Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
									<div className="py-1">
										<Menu.Item>
											{({ active }) => (
												<a
													href="/profile"
													className={`block px-4 py-2 text-sm ${
														active
															? 'bg-red-50 text-red-700'
															: 'text-gray-700'
													}`}
												>
													View Profile
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													href="/settings"
													className={`block px-4 py-2 text-sm ${
														active
															? 'bg-red-50 text-red-700'
															: 'text-gray-700'
													}`}
												>
													Settings
												</a>
											)}
										</Menu.Item>
									</div>
									<div className="py-1">
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={() => setIsLoggedIn(false)}
													className={`w-full text-left px-4 py-2 text-sm ${
														active
															? 'bg-red-50 text-red-700'
															: 'text-gray-700'
													}`}
												>
													Logout
												</button>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
					) : (
						<div className="hidden md:flex space-x-3">
							<a
								href="/login"
								className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
							>
								Login
							</a>
							<a
								href="/register"
								className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md text-sm font-medium hover:from-red-700 hover:to-red-800 transition-colors shadow-md"
							>
								Register
							</a>
						</div>
					)}

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="md:hidden p-2 rounded-md hover:bg-red-50 text-gray-700 hover:text-red-700 transition-colors"
						aria-label="Toggle menu"
					>
						{isMobileMenuOpen ? (
							<FiX className="w-5 h-5" />
						) : (
							<FiMenu className="w-5 h-5" />
						)}
					</button>
				</div>
			</nav>

			{/* Mobile Menu */}
			<div
				className={`md:hidden ${
					isMobileMenuOpen ? 'block' : 'hidden'
				} bg-white pb-4 shadow-md`}
			>
				<div className="px-2 pt-2 pb-3 space-y-1">
					{navigation.map(item => (
						<a
							key={item.name}
							href={item.href}
							className={`block px-3 py-2 rounded-md text-base font-medium ${
								item.current
									? 'bg-red-100 text-red-700'
									: 'text-gray-700 hover:bg-red-50 hover:text-red-700'
							}`}
						>
							{item.name}
						</a>
					))}
				</div>
				{!isLoggedIn && (
					<div className="px-5 pt-4 pb-2 border-t border-gray-200">
						<div className="space-y-2">
							<a
								href="/login"
								className="w-full block text-center px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
							>
								Login
							</a>
							<a
								href="/register"
								className="w-full block text-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-colors shadow-md"
							>
								Register
							</a>
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

const Home = () => {
	const [stats, setStats] = useState({ donors: 0, units: 0, lives: 0 });
	const controls = useAnimation();
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

	useEffect(() => {
		if (inView) {
			controls.start({ opacity: 1, y: 0 });
			animateStats();
		}
	}, [controls, inView]);

	const animateStats = () => {
		setStats({ donors: 0, units: 0, lives: 0 });
		setTimeout(() => {
			setStats({
				donors: 12456,
				units: 8453,
				lives: 25359,
			});
		}, 500);
	};

	const processSteps = [
		{
			number: 1,
			title: 'Find',
			content: 'Locate nearest donation centers using our smart map',
			icon: <FiMapPin className="text-white" />,
			color: 'bg-red-500',
		},
		{
			number: 2,
			title: 'Request',
			content: 'Schedule your donation appointment in 2 clicks',
			icon: <FiSearch className="text-white" />,
			color: 'bg-red-600',
		},
		{
			number: 3,
			title: 'Donate',
			content: 'Safe & comfortable donation experience',
			icon: <FiDroplet className="text-white" />,
			color: 'bg-red-700',
		},
	];

	const testimonials = [
		{
			quote: 'Donating blood was the most rewarding experience of my life. The staff made it so easy!',
			author: 'Sarah Johnson',
			role: 'Regular Donor (3+ years)',
			avatar: '/avatars/sarah.jpg',
		},
		{
			quote: "I'm alive today because of generous donors. Thank you for this life-saving platform.",
			author: 'Michael Chen',
			role: 'Blood Recipient',
			avatar: '/avatars/michael.jpg',
		},
		{
			quote: "As a doctor, I've seen firsthand how blood donations save lives. This platform makes it accessible to everyone.",
			author: 'Dr. Emily Davis',
			role: 'Cardiologist',
			avatar: '/avatars/emily.jpg',
		},
	];

	const WaveDivider = () => (
		<svg
			className="absolute bottom-0 left-0 w-full text-white"
			viewBox="0 0 1440 120"
			style={{ transform: 'rotate(180deg)' }}
		>
			<path
				fill="currentColor"
				d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
			/>
		</svg>
	);

	const GradientButton = ({ text, icon, className = '', glow = false, onClick, href }) => {
		const ButtonContent = () => (
			<>
				{text}
				{icon && <span className="ml-2">{icon}</span>}
			</>
		);

		if (href) {
			return (
				<a
					href={href}
					className={`bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full px-6 py-3 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-red-800 ${
						glow ? 'shadow-lg shadow-red-500/30' : ''
					} ${className}`}
					aria-label={text}
				>
					<ButtonContent />
				</a>
			);
		}

		return (
			<button
				onClick={onClick}
				className={`bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full px-6 py-3 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-red-800 ${
					glow ? 'shadow-lg shadow-red-500/30' : ''
				} ${className}`}
				aria-label={text}
			>
				<ButtonContent />
			</button>
		);
	};

	useEffect(() => {
		if (inView) {
			controls.start({ opacity: 1, y: 0 });
		}
	}, [controls, inView]);

	return (
		<div className="font-sans bg-gradient-to-b from-red-50 to-white overflow-hidden">
			<Header />

			{/* Hero Section */}
			<section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
				<div className="absolute inset-0 bg-red-900/80 z-0" />
				<video
					autoPlay
					muted
					loop
					playsInline
					className="absolute inset-0 w-full h-full object-cover z-0"
				>
					<source src="/videos/blood-donation-hero.mp4" type="video/mp4" />
					Your browser does not support the video tag.
				</video>

				<motion.div
					className="relative z-10 text-center px-4 max-w-4xl mx-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
				>
					<motion.h1
						className="text-4xl md:text-6xl font-bold text-white mb-6"
						initial={{ y: -50 }}
						animate={{ y: 0 }}
					>
						<span className="block mb-4">Give Blood,</span>
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-white">
							Save Lives
						</span>
					</motion.h1>

					<motion.p
						className="text-xl md:text-2xl text-red-100 mb-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						Every 2 seconds someone needs blood. Your donation can make the difference.
					</motion.p>

					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<GradientButton
							text="Find a Donation Center"
							icon={<FiMapPin className="ml-2" />}
							className="px-8 py-4 text-lg hover:shadow-xl"
							glow
						/>
						<button className="px-8 py-4 text-lg text-white border-2 border-white rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
							Learn More <FiChevronRight className="ml-2 animate-pulse" />
						</button>
					</div>
				</motion.div>

				<WaveDivider />
			</section>

			{/* Statistics Section */}
			<section className="py-20 bg-white" ref={ref}>
				<div className="container mx-auto px-4">
					<SectionHeading
						title="Our Impact"
						subtitle="Together we're saving lives"
						icon={<FiHeart className="text-red-600" />}
					/>

					<motion.div
						className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
						initial={{ opacity: 0, y: 20 }}
						animate={controls}
					>
						<StatsCard
							icon={<FiUsers className="text-4xl text-red-600" />}
							value={stats.donors}
							label="Active Donors"
							prefix="+"
							duration={2}
							shimmer
						/>
						<StatsCard
							icon={<FiDroplet className="text-4xl text-red-600" />}
							value={stats.units}
							label="Units Donated"
							prefix="+"
							duration={2.5}
							shimmer
						/>
						<StatsCard
							icon={<FiHeart className="text-4xl text-red-600" />}
							value={stats.lives}
							label="Lives Impacted"
							prefix="+"
							duration={3}
							shimmer
						/>
					</motion.div>
				</div>
			</section>

			{/* Process Section */}
			<section className="py-20 bg-gradient-to-b from-red-50 to-red-100 relative">
				<div className="container mx-auto px-4">
					<SectionHeading
						title="How It Works"
						subtitle="Simple steps to become a hero"
						icon={<FiDroplet className="text-red-600" />}
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative z-10">
						{processSteps.map((step, index) => (
							<ProcessStep
								key={index}
								number={step.number}
								title={step.title}
								content={step.content}
								icon={step.icon}
								color={step.color}
								delay={index * 0.2}
							/>
						))}
					</div>
				</div>
				<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50 to-transparent" />
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<SectionHeading
						title="Hero Stories"
						subtitle="Voices from our community"
						icon={<FiUsers className="text-red-600" />}
					/>
					<div className="mt-12 max-w-6xl mx-auto">
						<TestimonialCarousel testimonials={testimonials} />
					</div>
					<div className="mt-12 text-center">
						<GradientButton
							text="Share Your Story"
							icon={<FiHeart className="ml-2" />}
							className="px-8 py-3"
						/>
					</div>
				</div>
			</section>

			{/* Emergency CTA Section */}
			<section className="relative py-32 bg-gradient-to-br from-red-700 to-red-800 overflow-hidden">
				<div className="absolute inset-0 bg-[url('/images/blood-cells-pattern.png')] opacity-10" />
				<div className="container mx-auto px-4 text-center relative z-10">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						whileInView={{ scale: 1, opacity: 1 }}
						viewport={{ once: true }}
						transition={{ type: 'spring', stiffness: 50 }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							Urgent Need for Donors!
						</h2>
						<p className="text-red-100 mb-8 text-xl max-w-2xl mx-auto">
							Hospitals are facing critical shortages. Your donation today can save up
							to 3 lives.
						</p>
						<div className="flex flex-col md:flex-row justify-center gap-4">
							<GradientButton
								text="Find Nearest Center"
								className="px-12 py-6 text-xl hover:shadow-2xl"
								glow
								icon={<FiMapPin className="ml-3" />}
								href="/userdashboard"
							/>
							<button className="px-12 py-6 text-xl text-white border-2 border-white rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2">
								Emergency Request <FiChevronRight className="animate-pulse" />
							</button>
						</div>
					</motion.div>
				</div>

				{/* Pulsing emergency effect */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="absolute w-64 h-64 bg-red-600 rounded-full opacity-20 animate-ping-slow" />
				</div>
			</section>

			{/* Enhanced Footer */}
			<footer className="bg-gradient-to-b from-red-900 to-red-950 text-white py-12">
				<div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<h3 className="text-xl font-bold mb-4 flex items-center">
							<FiDroplet className="text-red-300 mr-2" /> Lifesaver
						</h3>
						<p className="text-red-200">
							Connecting donors with those in need since 2023
						</p>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Quick Links</h4>
						<ul className="space-y-2 text-red-200">
							<li>
								<a
									href="#"
									className="hover:text-red-300 transition-colors flex items-center"
								>
									<FiChevronRight className="mr-1 text-xs" /> Donate Blood
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-red-300 transition-colors flex items-center"
								>
									<FiChevronRight className="mr-1 text-xs" /> Request Blood
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-red-300 transition-colors flex items-center"
								>
									<FiChevronRight className="mr-1 text-xs" /> Eligibility
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-red-300 transition-colors flex items-center"
								>
									<FiChevronRight className="mr-1 text-xs" /> About Us
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Contact</h4>
						<ul className="space-y-2 text-red-200">
							<li className="flex items-start">
								<FiMapPin className="mt-1 mr-2 flex-shrink-0" />
								<span>123 Blood Drive Ave, Health City</span>
							</li>
							<li className="flex items-center">
								<FiClock className="mr-2 flex-shrink-0" />
								<span>24/7 Helpline: 1-800-HELP-NOW</span>
							</li>
							<li className="flex items-center">
								<FiDroplet className="mr-2 flex-shrink-0" />
								<span>emergency@lifesaver.com</span>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Follow Us</h4>
						<div className="flex space-x-4">
							<a
								href="#"
								aria-label="Facebook"
								className="text-red-200 hover:text-red-300 transition-colors"
							>
								<FiFacebook className="w-6 h-6" />
							</a>
							<a
								href="#"
								aria-label="Twitter"
								className="text-red-200 hover:text-red-300 transition-colors"
							>
								<FiTwitter className="w-6 h-6" />
							</a>
							<a
								href="#"
								aria-label="Instagram"
								className="text-red-200 hover:text-red-300 transition-colors"
							>
								<FiInstagram className="w-6 h-6" />
							</a>
							<a
								href="#"
								aria-label="LinkedIn"
								className="text-red-200 hover:text-red-300 transition-colors"
							>
								<FiLinkedin className="w-6 h-6" />
							</a>
						</div>
					</div>
				</div>
				<div className="text-center mt-8 pt-8 border-t border-red-800">
					<p className="text-red-300">
						&copy; {new Date().getFullYear()} Lifesaver. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
};

export default Home;
