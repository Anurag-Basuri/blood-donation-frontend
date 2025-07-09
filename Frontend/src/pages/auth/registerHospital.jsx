import { useContext, useState } from 'react';
import { FormContext } from '../../context/FormContext.jsx';
import { hospitalRegister } from '../../services/authService.js';
import PropTypes from 'prop-types';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

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

	const fields = [
		{ key: 'name', label: 'Hospital Name', type: 'text' },
		{ key: 'email', label: 'Email Address', type: 'email' },
		{ key: 'address', label: 'Full Address', type: 'text' },
		{ key: 'contactPerson', label: 'Contact Person', type: 'text' },
		{ key: 'emergencyContact', label: 'Emergency Contact', type: 'tel' },
		{ key: 'specialties', label: 'Specialties', type: 'text' },
		{ key: 'registrationNumber', label: 'Registration Number', type: 'text' },
		{
			key: 'password',
			label: 'Password',
			type: showPassword ? 'text' : 'password',
			icon: showPassword ? EyeOff : Eye,
			onIconClick: () => setShowPassword(!showPassword),
		},
		{
			key: 'confirmPassword',
			label: 'Confirm Password',
			type: showConfirmPassword ? 'text' : 'password',
			icon: showConfirmPassword ? EyeOff : Eye,
			onIconClick: () => setShowConfirmPassword(!showConfirmPassword),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-6">
				<button
					onClick={prev}
					className="flex items-center text-gray-300 hover:text-white transition-colors"
				>
					<ArrowLeft className="w-5 h-5 mr-1" /> Back
				</button>
				<h2 className="text-2xl font-bold text-white">Hospital Registration</h2>
				<div className="w-6"></div> {/* Spacer for alignment */}
			</div>

			{error && (
				<div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-sm">
					{error}
				</div>
			)}

			<form onSubmit={submit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{fields.map(field => (
						<div key={field.key} className="relative group">
							<label className="block text-sm font-medium text-gray-200 mb-1">
								{field.label}
							</label>
							<div className="relative">
								<input
									required
									value={local[field.key]}
									onChange={handle(field.key)}
									type={field.type}
									className="w-full pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200 hover:bg-white/15"
									placeholder={`Enter ${field.label.toLowerCase()}`}
								/>
								{field.icon && (
									<button
										type="button"
										onClick={field.onIconClick}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
									>
										<field.icon className="h-5 w-5" />
									</button>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="flex justify-between pt-4">
					<button
						type="button"
						onClick={prev}
						className="px-6 py-3 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
					>
						Back
					</button>
					<button
						type="submit"
						className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-xl transition-all flex items-center"
					>
						Complete Registration <ArrowRight className="w-5 h-5 ml-2" />
					</button>
				</div>
			</form>
		</div>
	);
}

RegisterHospital.propTypes = {
	next: PropTypes.func.isRequired,
	prev: PropTypes.func.isRequired,
};
