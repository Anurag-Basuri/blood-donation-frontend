// src/pages/Auth/Auth.jsx
import { useState } from 'react';
import axiosInstance from '../../services/api';

const Auth = () => {
	const [isRegistering, setIsRegistering] = useState(false);
	const [formData, setFormData] = useState({
		accountType: '',
		fullName: '',
		email: '',
		phone: '',
		bloodType: '',
		password: '',
		confirmPassword: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const toggleForm = () => {
		setIsRegistering(!isRegistering);
		setFormData({ accountType: '', fullName: '', email: '', phone: '', bloodType: '', password: '', confirmPassword: '' });
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			if (isRegistering) {
				// Register logic
				const res = await axiosInstance.post('/auth/register', formData);
				console.log(res.data);
			} else {
				// Login logic
				const res = await axiosInstance.post('/auth/login', {
					email: formData.email,
					password: formData.password
				});
				console.log(res.data);
			}
		} catch (err) {
			setError(err?.response?.data?.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	const showBloodTypes = formData.accountType === 'donor';

	return (
		<div className="min-h-screen bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 flex justify-center items-center px-4">
			<div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-xl relative z-10 text-white">
				<h2 className="text-3xl font-bold mb-4 text-center">
					{isRegistering ? 'Create Account' : 'Login to LifeConnect'}
				</h2>

				{error && <p className="text-red-300 text-sm mb-4">{error}</p>}

				<form onSubmit={handleSubmit} className="space-y-4">
					{isRegistering && (
						<>
							<select
								name="accountType"
								value={formData.accountType}
								onChange={handleChange}
								className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
								required
							>
								<option value="">Select Account Type</option>
								<option value="donor">Blood Donor</option>
								<option value="hospital">Hospital</option>
								<option value="ngo">NGO</option>
								<option value="volunteer">Volunteer</option>
							</select>

							<input
								type="text"
								name="fullName"
								placeholder="Full Name"
								value={formData.fullName}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
							/>

							<input
								type="tel"
								name="phone"
								placeholder="Phone Number"
								value={formData.phone}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
							/>
						</>
					)}

					<input
						type="email"
						name="email"
						placeholder="Email"
						value={formData.email}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
					/>

					<input
						type="password"
						name="password"
						placeholder="Password"
						value={formData.password}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
					/>

					{isRegistering && (
						<>
							<input
								type="password"
								name="confirmPassword"
								placeholder="Confirm Password"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
							/>

							{showBloodTypes && (
								<select
									name="bloodType"
									value={formData.bloodType}
									onChange={handleChange}
									className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
									required
								>
									<option value="">Select Blood Type</option>
									<option value="A+">A+</option>
									<option value="A-">A-</option>
									<option value="B+">B+</option>
									<option value="B-">B-</option>
									<option value="AB+">AB+</option>
									<option value="AB-">AB-</option>
									<option value="O+">O+</option>
									<option value="O-">O-</option>
								</select>
							)}
						</>
					)}

					<button
						type="submit"
						className={`w-full py-2 rounded-md font-bold transition ${
							isRegistering
								? 'bg-teal-500 hover:bg-teal-600'
								: 'bg-red-500 hover:bg-red-600'
						}`}
						disabled={loading}
					>
						{loading
							? 'Please wait...'
							: isRegistering
							? 'Register'
							: 'Login'}
					</button>
				</form>

				<div className="mt-4 text-center">
					<button onClick={toggleForm} className="text-sm text-white/80 hover:underline">
						{isRegistering
							? 'Already have an account? Login'
							: "Don't have an account? Register"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Auth;
