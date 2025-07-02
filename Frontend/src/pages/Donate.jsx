import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	FiMenu,
	FiX,
	FiUser,
	FiHome,
	FiInfo,
	FiDroplet,
	FiMail,
	FiSettings,
	FiLogOut,
} from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(true);
	const [userType] = useState('user');

	const navigation = [
		{ name: 'Home', href: '/', icon: <FiHome />, current: false },
		{ name: 'About', href: '/about', icon: <FiInfo />, current: false },
		{ name: 'Donate', href: '/donate', icon: <FiDroplet />, current: true },
		{ name: 'Contact', href: '/contact', icon: <FiMail />, current: false },
		{
			name: 'Dashboard',
			href: userType === 'ngo' ? '/ngodashboard' : '/userdashboard',
			icon: <FiUser />,
			current: false,
		},
	];

	return (
		<header className="sticky top-0 z-50 bg-white shadow-sm">
			<nav className="container mx-auto px-4 py-3 flex items-center justify-between">
				{/* Logo */}
				<a href="/" className="flex items-center space-x-2">
					<div className="w-7 h-7 bg-gradient-to-r from-red-600 to-red-700 text-white p-1.5 rounded-full flex items-center justify-center">
						<FiDroplet className="text-xl" />
					</div>
					<span className="text-2xl font-bold text-red-700">Lifesaver</span>
				</a>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center space-x-6">
					{navigation.map(item => (
						<a
							key={item.name}
							href={item.href}
							className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
								item.current
									? 'bg-red-100 text-red-700'
									: 'text-gray-700 hover:bg-red-50 hover:text-red-700'
							}`}
						>
							{item.icon}
							<span>{item.name}</span>
						</a>
					))}
				</div>

				{/* Right Section */}
				<div className="flex items-center space-x-4">
					{isLoggedIn ? (
						<Menu as="div" className="relative">
							<Menu.Button className="flex items-center space-x-2 focus:outline-none">
								<div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors">
									<FiUser className="text-red-700 text-lg" />
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
													className={`flex items-center space-x-2 px-4 py-2 text-sm ${
														active
															? 'bg-red-50 text-red-700'
															: 'text-gray-700'
													}`}
												>
													<FiUser className="text-lg" />
													<span>Profile</span>
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													href="/settings"
													className={`flex items-center space-x-2 px-4 py-2 text-sm ${
														active
															? 'bg-red-50 text-red-700'
															: 'text-gray-700'
													}`}
												>
													<FiSettings className="text-lg" />
													<span>Settings</span>
												</a>
											)}
										</Menu.Item>
									</div>
									<div className="py-1">
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={() => setIsLoggedIn(false)}
													className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
														active
															? 'bg-red-50 text-red-700'
															: 'text-gray-700'
													}`}
												>
													<FiLogOut className="text-lg" />
													<span>Logout</span>
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
								className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-2"
							>
								<FiUser className="text-lg" />
								<span>Login</span>
							</a>
							<a
								href="/register"
								className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md text-sm font-medium hover:from-red-700 hover:to-red-800 transition-colors shadow-md flex items-center space-x-2"
							>
								<FiDroplet className="text-lg" />
								<span>Register</span>
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
							className={`block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
								item.current
									? 'bg-red-100 text-red-700'
									: 'text-gray-700 hover:bg-red-50 hover:text-red-700'
							}`}
						>
							{item.icon}
							<span>{item.name}</span>
						</a>
					))}
				</div>
				{!isLoggedIn && (
					<div className="px-5 pt-4 pb-2 border-t border-gray-200">
						<div className="space-y-2">
							<a
								href="/login"
								className="w-full block text-center px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
							>
								<FiUser className="text-lg" />
								<span>Login</span>
							</a>
							<a
								href="/register"
								className="w-full block text-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-colors shadow-md flex items-center justify-center space-x-2"
							>
								<FiDroplet className="text-lg" />
								<span>Register</span>
							</a>
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

const Donate = () => {
	const [donationType, setDonationType] = useState('one-time');
	const [amount, setAmount] = useState(500);

	const impactStats = [
		{ label: 'Lives Saved', value: '500+', icon: '🚑' },
		{ label: 'Donations Processed', value: '1,200', icon: '🩸' },
		{ label: 'Camps Organized', value: '80+', icon: '❤️' },
	];

	const donationTiers = [
		{ amount: 500, description: "Supports a donor's medical checkup" },
		{ amount: 1000, description: 'Helps set up a blood donation camp' },
		{ amount: 5000, description: 'Covers logistics for 50+ donors' },
	];

	// Animation variants
	const fadeInUp = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			{/* Hero Section */}
			<section className="relative h-screen flex items-center justify-center overflow-hidden">
				<div className="absolute inset-0 z-0 bg-gradient-to-r from-red-900/40 to-transparent" />

				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeInUp}
					className="relative z-10 text-center px-4"
				>
					<motion.h1
						className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
						variants={fadeInUp}
					>
						💖 Your Contribution, Their Lifeline!
					</motion.h1>

					<motion.p className="text-xl mb-8 text-red-700/80" variants={fadeInUp}>
						Every Drop Counts in Saving Lives
					</motion.p>

					<motion.div
						className="flex flex-wrap justify-center gap-4 mb-12"
						variants={fadeInUp}
					>
						{impactStats.map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: index * 0.1 }}
								className="p-4 bg-red-100 rounded-xl hover:bg-red-200 transition-colors"
							>
								<div className="text-2xl md:text-3xl text-red-600">
									{stat.icon} {stat.value}
								</div>
								<div className="text-sm text-red-700/80">{stat.label}</div>
							</motion.div>
						))}
					</motion.div>

					<motion.div
						className="flex flex-col md:flex-row justify-center gap-4"
						variants={fadeInUp}
					>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="px-8 py-4 bg-red-600 rounded-xl font-semibold text-white shadow-lg hover:bg-red-700 transition-all"
						>
							🏥 Support Blood Camps
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="px-8 py-4 bg-red-800 rounded-xl font-semibold text-white shadow-lg hover:bg-red-900 transition-all"
						>
							🚑 Emergency Support
						</motion.button>
					</motion.div>
				</motion.div>
			</section>

			{/* Why Donate Section */}
			<section className="py-20 px-4 md:px-8">
				<motion.h2
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					className="text-4xl md:text-5xl text-center mb-16 font-bold text-red-600"
				>
					Your Contribution Matters
				</motion.h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{donationTiers.map((tier, index) => (
						<motion.div
							key={tier.amount}
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '0px 0px -100px 0px' }}
							transition={{ delay: index * 0.2 }}
							className="p-8 rounded-3xl bg-white border border-red-100 hover:bg-red-50 transition-all shadow-lg"
						>
							<div className="text-4xl md:text-5xl font-bold mb-4 text-red-600">
								₹{tier.amount}
							</div>
							<p className="text-lg text-red-700">{tier.description}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Transparency Section */}
			<section className="py-20 px-4 md:px-8 bg-red-50">
				<div className="max-w-6xl mx-auto">
					<motion.h2
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						className="text-4xl md:text-5xl text-center mb-16 font-bold text-red-600"
					>
						Where Your Money Goes
					</motion.h2>

					<div className="grid md:grid-cols-2 gap-12">
						{/* Fund Breakdown */}
						<motion.div
							className="space-y-6"
							initial={{ x: -50, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
						>
							<div className="p-8 rounded-3xl bg-white shadow-xl">
								<h3 className="text-2xl font-bold mb-6 text-red-600">
									Fund Breakdown
								</h3>
								<div className="space-y-4">
									{[
										['Donation Camps', '40%', 'bg-red-400'],
										['Medical Facilities', '30%', 'bg-red-300'],
										['Awareness Campaigns', '20%', 'bg-red-200'],
										['Administration', '10%', 'bg-red-100'],
									].map(([label, percentage, color]) => (
										<div key={label} className="space-y-2">
											<div className="flex justify-between text-red-700">
												<span>{label}</span>
												<span>{percentage}</span>
											</div>
											<div className="h-2 bg-red-100 rounded-full">
												<div
													className={`h-full rounded-full ${color}`}
													style={{ width: percentage }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						{/* Impact Stories */}
						<motion.div
							className="space-y-6"
							initial={{ x: 50, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
						>
							<div className="p-8 rounded-3xl bg-white shadow-xl">
								<h3 className="text-2xl font-bold mb-6 text-red-600">
									Real Impact Stories
								</h3>
								<div className="space-y-6">
									{[
										"Your donations helped save my daughter's life during emergency surgery.",
										'Blood camps organized through your support helped 50+ patients last month.',
										'Emergency funds provided blood units to accident victims within hours.',
									].map((story, index) => (
										<div
											key={index}
											className="p-4 rounded-xl bg-red-50 transition-all hover:scale-[1.02]"
										>
											<p className="text-red-700">{story}</p>
											<div className="mt-2 text-red-500">
												- Anonymous Donor
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Donation Form Section */}
			<section className="py-20 px-4 md:px-8">
				<div className="max-w-2xl mx-auto">
					<motion.h2
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						className="text-4xl md:text-5xl text-center mb-12 font-bold text-red-600"
					>
						Make a Difference
					</motion.h2>

					<div className="p-8 rounded-3xl bg-white shadow-xl">
						<form className="space-y-8">
							{/* Donation Type */}
							<div className="grid grid-cols-2 gap-4">
								{['one-time', 'monthly'].map(type => (
									<motion.button
										key={type}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										type="button"
										onClick={() => setDonationType(type)}
										className={`p-4 rounded-xl transition-all ${
											donationType === type
												? 'bg-red-600 text-white shadow-lg'
												: 'bg-red-50 hover:bg-red-100'
										}`}
									>
										{type.charAt(0).toUpperCase() + type.slice(1)} Donation
									</motion.button>
								))}
							</div>

							{/* Amount Selection */}
							<div className="space-y-6">
								<h3 className="text-xl font-bold text-red-600">
									Select Amount (₹)
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{[500, 1000, 5000].map(amt => (
										<motion.button
											key={amt}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											type="button"
											onClick={() => setAmount(amt)}
											className={`p-4 rounded-xl transition-all ${
												amount === amt
													? 'bg-red-600 text-white shadow-lg'
													: 'bg-red-50 hover:bg-red-100'
											}`}
										>
											₹{amt}
										</motion.button>
									))}
								</div>
								<input
									type="number"
									value={amount}
									min="100"
									step="100"
									onChange={e => setAmount(Math.max(100, Number(e.target.value)))}
									className="w-full p-4 rounded-xl bg-red-50 text-red-700 outline-none focus:bg-red-100 transition-all"
									placeholder="Custom Amount"
								/>
							</div>

							{/* Submit Button */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type="submit"
								className="w-full py-4 bg-red-600 rounded-xl font-semibold text-lg text-white hover:bg-red-700 transition-all shadow-lg"
							>
								Donate Now
							</motion.button>
						</form>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Donate;
