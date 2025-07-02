import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadScript } from '@react-google-maps/api';
import DonorForm from '../components/DonorForm.jsx';
import NGOForm from '../components/NGOForm.jsx';
import HospitalForm from '../components/HospitalForm.jsx';

// Context for role management
const RoleContext = createContext();

export function RoleProvider({ children }) {
	const [selectedRole, setSelectedRole] = useState(null);
	return (
		<RoleContext.Provider value={{ selectedRole, setSelectedRole }}>
			{children}
		</RoleContext.Provider>
	);
}

export function useRoleContext() {
	return useContext(RoleContext);
}

function RegistrationContent() {
	const [liveCounter, setLiveCounter] = useState(3257);
	const { selectedRole, setSelectedRole } = useRoleContext();
	const [formStep, setFormStep] = useState(0);

	// Simulate live counter updates
	useEffect(() => {
		const interval = setInterval(() => {
			setLiveCounter(prev => prev + Math.floor(Math.random() * 5));
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="dark min-h-screen bg-gray-900 text-gray-100">
			{/* Hero Section */}
			<section className="relative h-screen bg-gradient-to-b from-black to-gray-900">
				<div className="absolute inset-0 z-0 opacity-20">
					{/* Floating blood cells animation placeholder */}
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4"
				>
					<motion.h1
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						className="mb-6 text-4xl md:text-5xl font-bold leading-tight"
					>
						Your First Step Towards Saving Lives Begins Here
					</motion.h1>
					<motion.p
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						className="mb-8 text-lg md:text-xl text-gray-300"
					>
						Join the movement, register today, and be the reason someone gets a second
						chance at life
					</motion.p>

					{/* Live Counter */}
					<motion.div
						className="mb-8 text-red-400 text-xl"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
					>
						<span className="font-bold">{liveCounter.toLocaleString()}</span> Heroes
						Registered
					</motion.div>

					{/* Role Selection */}
					<div className="grid gap-8 md:grid-cols-3 max-w-4xl w-full">
						{['donor', 'ngo', 'hospital'].map(role => (
							<motion.div
								key={role}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="glass-effect bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 cursor-pointer"
								onClick={() => setSelectedRole(role)}
							>
								<div className="text-6xl mb-4">
									{role === 'donor' ? '🩸' : role === 'ngo' ? '🎗️' : '🏥'}
								</div>
								<h3 className="text-xl font-semibold">
									Register as {role.charAt(0).toUpperCase() + role.slice(1)}
								</h3>
							</motion.div>
						))}
					</div>
				</motion.div>
			</section>

			{/* Dynamic Forms */}
			<div className="container mx-auto px-4 py-16">
				<AnimatePresence mode="wait">
					{selectedRole === 'donor' && (
						<DonorForm key="donor" formStep={formStep} setFormStep={setFormStep} />
					)}

					{selectedRole === 'ngo' && (
						<NGOForm key="ngo" formStep={formStep} setFormStep={setFormStep} />
					)}

					{selectedRole === 'hospital' && (
						<HospitalForm
							key="hospital"
							formStep={formStep}
							setFormStep={setFormStep}
						/>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default function Registration() {
	return (
		<LoadScript
			googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with your API key
			libraries={['places']}
		>
			<RoleProvider>
				<RegistrationContent />
			</RoleProvider>
		</LoadScript>
	);
}
