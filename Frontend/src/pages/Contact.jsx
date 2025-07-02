import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	FiMail,
	FiPhone,
	FiMapPin,
	FiFile,
	FiMenu,
	FiX,
	FiUser,
	FiHome,
	FiInfo,
	FiDroplet,
	FiSettings,
	FiLogOut,
} from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react';

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(true);
	const [userType] = useState('user');

	const navigation = [
		{ name: 'Home', href: '/', icon: <FiHome />, current: false },
		{ name: 'About', href: '/about', icon: <FiInfo />, current: false },
		{ name: 'Donate', href: '/donate', icon: <FiDroplet />, current: false },
		{ name: 'Contact', href: '/contact', icon: <FiMail />, current: true },
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

const Contact = () => {
	const [formData, setFormData] = useState({
		orgName: '',
		contactName: '',
		email: '',
		phone: '',
		message: '',
		file: null,
	});

	const handleSubmit = e => {
		e.preventDefault();
		// Handle form submission
	};

	const handleFileChange = e => {
		setFormData({ ...formData, file: e.target.files[0] });
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			{/* Hero Section */}
			<motion.section
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="relative h-96 overflow-hidden bg-gradient-to-r from-red-600 to-red-800"
			>
				<div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent" />
				<div className="relative h-full flex items-center justify-center p-6">
					<motion.div
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						className="text-center space-y-4"
					>
						<h1 className="text-5xl font-bold text-white">Get in Touch</h1>
						<p className="text-xl text-red-100">We value your support</p>
					</motion.div>
				</div>
			</motion.section>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
				{/* Contact Form */}
				<motion.form
					onSubmit={handleSubmit}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="lg:col-span-2 p-8 rounded-2xl bg-white shadow-lg border border-red-100"
				>
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<InputField
								label="Organization Name"
								id="orgName"
								value={formData.orgName}
								onChange={e =>
									setFormData({ ...formData, orgName: e.target.value })
								}
							/>
							<InputField
								label="Contact Person"
								id="contactName"
								value={formData.contactName}
								onChange={e =>
									setFormData({ ...formData, contactName: e.target.value })
								}
							/>
							<InputField
								label="Email"
								id="email"
								type="email"
								value={formData.email}
								onChange={e => setFormData({ ...formData, email: e.target.value })}
							/>
							<InputField
								label="Phone"
								id="phone"
								type="tel"
								value={formData.phone}
								onChange={e => setFormData({ ...formData, phone: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-gray-700">Message</label>
							<textarea
								className="w-full p-4 bg-red-50 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
								rows={5}
								value={formData.message}
								onChange={e =>
									setFormData({ ...formData, message: e.target.value })
								}
							/>
						</div>

						<FileUpload file={formData.file} onChange={handleFileChange} />

						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg hover:shadow-red-500/30"
							type="submit"
						>
							Submit Request
						</motion.button>
					</div>
				</motion.form>

				{/* Contact Sidebar */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					className="p-8 rounded-2xl bg-white shadow-lg border border-red-100 h-fit"
				>
					<div className="space-y-8">
						<ContactInfo
							icon={<FiMail className="text-red-600" />}
							title="Email"
							value="contact@lifesaver.org"
						/>
						<ContactInfo
							icon={<FiPhone className="text-red-600" />}
							title="24/7 Helpline"
							value="+1 800 123 4567"
						/>
						<ContactInfo
							icon={<FiMapPin className="text-red-600" />}
							title="Headquarters"
							value="123 Life Saver Street, Global City"
						/>

						<div className="pt-6 border-t border-red-200">
							<h3 className="text-xl font-semibold text-red-700 mb-4">
								Connect With Us
							</h3>
							<div className="flex space-x-4">
								<SocialIcon
									icon={
										<FaFacebook className="text-red-600 hover:text-red-700" />
									}
								/>
								<SocialIcon
									icon={<FaTwitter className="text-red-600 hover:text-red-700" />}
								/>
								<SocialIcon
									icon={
										<FaLinkedin className="text-red-600 hover:text-red-700" />
									}
								/>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

// Reusable Components
const InputField = ({ label, id, type = 'text', value, onChange }) => (
	<div className="space-y-2">
		<label htmlFor={id} className="text-gray-700">
			{label}
		</label>
		<input
			id={id}
			type={type}
			className="w-full p-4 bg-red-50 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
			value={value}
			onChange={onChange}
		/>
	</div>
);

const FileUpload = ({ file, onChange }) => (
	<div className="space-y-2">
		<label className="inline-flex items-center gap-2 cursor-pointer">
			<FiFile className="text-red-600" />
			<span className="text-gray-700">Attach Documents</span>
			<input type="file" className="hidden" onChange={onChange} />
		</label>
		{file && <p className="text-sm text-gray-500">{file.name}</p>}
	</div>
);

const ContactInfo = ({ icon, title, value }) => (
	<div className="flex items-start gap-4">
		<div className="text-2xl">{icon}</div>
		<div>
			<h4 className="text-gray-600 font-medium">{title}</h4>
			<p className="text-gray-800">{value}</p>
		</div>
	</div>
);

const SocialIcon = ({ icon }) => (
	<motion.div
		whileHover={{ scale: 1.1 }}
		className="p-3 rounded-full bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
	>
		{icon}
	</motion.div>
);

export default Contact;
