import { useContext, useState } from 'react';
import { FormContext } from '../../context/FormContext.jsx';
import { hospitalRegister } from '../../services/authService.js';
import PropTypes from 'prop-types';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function RegisterHospital({ next, prev }) {
	const { update } = useContext(FormContext);
	const [local, setLocal] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		address: '',
		contactPerson: '',
		emergencyContact: '',
		specialties: '',
		registrationNumber: '',
	});
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handle = k => e => setLocal({ ...local, [k]: e.target.value });

	const submit = async e => {
		e.preventDefault();
		if (local.password !== local.confirmPassword) {
			setError('Passwords do not match');
			return;
		}
		update(local);
		try {
			await hospitalRegister(
				local.name,
				local.email,
				local.address,
				local.contactPerson,
				local.emergencyContact,
				local.specialties,
				local.registrationNumber,
				local.password,
			);
			next();
		} catch (err) {
			setError(err.response?.data?.message || 'Registration failed');
		}
	};

	return (
		<motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<div className="flex items-center justify-between mb-6">
				<motion.button
					onClick={prev}
					className="flex items-center text-gray-300 hover:text-white transition-colors"
					whileHover={{ x: -5 }}
					whileTap={{ scale: 0.95 }}
				>
					<ArrowLeft className="w-5 h-5 mr-1" /> Back
				</motion.button>
				<h2 className="text-2xl font-bold text-white">Hospital Registration</h2>
				<div className="w-6"></div>
			</div>

			{error && (
				<motion.div
					className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-sm"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
				>
					{error}
				</motion.div>
			)}

			<form onSubmit={submit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input label="Hospital Name" value={local.name} onChange={handle('name')} />
					<Input
						label="Email Address"
						type="email"
						value={local.email}
						onChange={handle('email')}
					/>
					<Input
						label="Full Address"
						value={local.address}
						onChange={handle('address')}
					/>
					<Input
						label="Contact Person"
						value={local.contactPerson}
						onChange={handle('contactPerson')}
					/>
					<Input
						label="Emergency Contact"
						type="tel"
						value={local.emergencyContact}
						onChange={handle('emergencyContact')}
					/>
					<Input
						label="Specialties"
						value={local.specialties}
						onChange={handle('specialties')}
					/>
					<Input
						label="Registration Number"
						value={local.registrationNumber}
						onChange={handle('registrationNumber')}
					/>
					<Input
						label="Password"
						type={showPassword ? 'text' : 'password'}
						value={local.password}
						onChange={handle('password')}
						icon={showPassword ? EyeOff : Eye}
						onIconClick={() => setShowPassword(v => !v)}
					/>
					<Input
						label="Confirm Password"
						type={showConfirmPassword ? 'text' : 'password'}
						value={local.confirmPassword}
						onChange={handle('confirmPassword')}
						icon={showConfirmPassword ? EyeOff : Eye}
						onIconClick={() => setShowConfirmPassword(v => !v)}
					/>
				</div>
				<div className="flex justify-between pt-4">
					<motion.button
						type="button"
						onClick={prev}
						className="px-6 py-3 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Back
					</motion.button>
					<motion.button
						type="submit"
						className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-xl transition-all flex items-center"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Complete Registration <ArrowRight className="w-5 h-5 ml-2" />
					</motion.button>
				</div>
			</form>
		</motion.div>
	);
}

function Input({ label, type = 'text', value, onChange, icon: Icon, onIconClick }) {
	return (
		<div className="relative group">
			<input
				required
				type={type}
				value={value}
				onChange={onChange}
				className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200 peer"
				placeholder={label}
			/>
			<label
				className={`absolute left-4 transition-all duration-200 ${
					value ? 'top-1 text-xs text-gray-300' : 'top-1/2 -translate-y-1/2 text-gray-400'
				} pointer-events-none`}
			>
				{label}
			</label>
			{Icon && (
				<button
					type="button"
					onClick={onIconClick}
					className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
				>
					<Icon className="h-5 w-5" />
				</button>
			)}
		</div>
	);
}

RegisterHospital.propTypes = {
	next: PropTypes.func.isRequired,
	prev: PropTypes.func.isRequired,
};